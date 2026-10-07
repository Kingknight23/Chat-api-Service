import WS_EVENTS from "./websocket.events.js";


class WebSocketManager {
    constructor() {
        this.socket = null;

        this.token = null;

        this.listeners = new Map();

        this.subscriptions = new Set();

        this.reconnectAttempts = 0;

        this.maxReconnectAttempts = 10;

        this.reconnectTimer = null;

        this.isManuallyClosed = false;
    }


    /*
    |--------------------------------------------------------------------------
    | Connect
    |--------------------------------------------------------------------------
    */

    connect(token) {
        if (!token) {
            console.error(
                "WebSocket connection requires a token"
            );

            return;
        }

        this.token = token;

        this.isManuallyClosed = false;

        if (
            this.socket &&
            (
                this.socket.readyState ===
                WebSocket.OPEN ||

                this.socket.readyState ===
                WebSocket.CONNECTING
            )
        ) {
            return;
        }

        const protocol =
            window.location.protocol === "https:"
                ? "wss:"
                : "ws:";

        const host =
            import.meta.env.VITE_WS_URL ||
            `${protocol}//${window.location.host}`;

        const url = `${host}/ws`;

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log("WebSocket connected");

            this.reconnectAttempts = 0;

            this.emitInternal(
                "connection.status",
                "connected"
            );

            // Authenticate inside the WebSocket frame instead of putting
            // the JWT in the URL where proxies/server logs may record it.
            this.socket.send(JSON.stringify({
                type: "auth",
                data: { token: this.token }
            }));
        };


        this.socket.onmessage = (event) => {
            try {
                const message =
                    JSON.parse(event.data);

                this.handleMessage(message);
            } catch (error) {
                console.error(
                    "Invalid WebSocket message:",
                    error
                );
            }
        };


        this.socket.onerror = (error) => {
            console.error(
                "WebSocket error:",
                error
            );
        };


        this.socket.onclose = (event) => {
            console.log(
                "WebSocket disconnected",
                event.code,
                event.reason
            );

            this.socket = null;

            this.emitInternal(
                "connection.status",
                "disconnected"
            );

            if (
                !this.isManuallyClosed
            ) {
                this.reconnect();
            }
        };
    }


    /*
    |--------------------------------------------------------------------------
    | Disconnect
    |--------------------------------------------------------------------------
    */

    disconnect() {
        this.isManuallyClosed = true;

        if (this.reconnectTimer) {
            clearTimeout(
                this.reconnectTimer
            );

            this.reconnectTimer = null;
        }

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        this.token = null;
    }


    /*
    |--------------------------------------------------------------------------
    | Reconnect
    |--------------------------------------------------------------------------
    */

    reconnect() {
        if (
            this.isManuallyClosed ||
            !this.token
        ) {
            return;
        }

        if (
            this.reconnectAttempts >=
            this.maxReconnectAttempts
        ) {
            console.error(
                "Maximum WebSocket reconnect attempts reached"
            );

            return;
        }

        this.reconnectAttempts += 1;

        const delay =
            Math.min(
                1000 *
                Math.pow(
                    2,
                    this.reconnectAttempts - 1
                ),
                30000
            );

        this.reconnectTimer =
            setTimeout(() => {
                console.log(
                    "Attempting WebSocket reconnect..."
                );

                this.connect(
                    this.token
                );
            }, delay);
    }


    /*
    |--------------------------------------------------------------------------
    | Message Handling
    |--------------------------------------------------------------------------
    */

    handleMessage(message) {
        if (!message) {
            return;
        }

        const event =
            message.event ||
            message.type;

        if (!event) {
            return;
        }

        if (event === "connection.ready") {
            this.resubscribe();
        }

        this.emitInternal(
            event,
            message.data
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Send
    |--------------------------------------------------------------------------
    */

    send(event, data = {}) {
        if (
            !this.socket ||
            this.socket.readyState !==
            WebSocket.OPEN
        ) {
            console.error(
                "WebSocket is not connected"
            );

            return false;
        }

        this.socket.send(
            JSON.stringify({
                type: event,
                event,
                data
            })
        );

        return true;
    }


    /*
    |--------------------------------------------------------------------------
    | Event Listeners
    |--------------------------------------------------------------------------
    */

    on(event, callback) {
        if (
            !this.listeners.has(event)
        ) {
            this.listeners.set(
                event,
                new Set()
            );
        }

        this.listeners
            .get(event)
            .add(callback);

        return () => {
            this.off(
                event,
                callback
            );
        };
    }


    off(event, callback) {
        const callbacks =
            this.listeners.get(event);

        if (!callbacks) {
            return;
        }

        callbacks.delete(callback);

        if (callbacks.size === 0) {
            this.listeners.delete(event);
        }
    }


    emitInternal(event, data) {
        const callbacks =
            this.listeners.get(event);

        if (!callbacks) {
            return;
        }

        callbacks.forEach(
            (callback) => {
                callback(data);
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Conversations
    |--------------------------------------------------------------------------
    */

    subscribe(conversationId) {
        if (!conversationId) {
            return;
        }

        this.subscriptions.add(
            conversationId
        );

        this.send(
            WS_EVENTS.CONVERSATION_SUBSCRIBE,
            {
                conversationId
            }
        );
    }


    unsubscribe(conversationId) {
        if (!conversationId) {
            return;
        }

        this.subscriptions.delete(
            conversationId
        );

        this.send(
            WS_EVENTS.CONVERSATION_UNSUBSCRIBE,
            {
                conversationId
            }
        );
    }


    resubscribe() {
        this.subscriptions.forEach(
            (conversationId) => {
                this.send(
                    WS_EVENTS.CONVERSATION_SUBSCRIBE,
                    {
                        conversationId
                    }
                );
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Messages
    |--------------------------------------------------------------------------
    */

    sendMessage(
        conversationId,
        text
    ) {
        return this.send(
            WS_EVENTS.MESSAGE_SEND,
            {
                conversationId,
                messageType: "TEXT",
                payloadType: "text",
                payload: {
                    text
                }
            }
        );
    }


    markMessageRead(
        messageId
    ) {
        return this.send(
            WS_EVENTS.MESSAGE_READ,
            {
                messageId
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Typing
    |--------------------------------------------------------------------------
    */

    startTyping(
        conversationId
    ) {
        return this.send(
            WS_EVENTS.TYPING_START,
            {
                conversationId
            }
        );
    }


    stopTyping(
        conversationId
    ) {
        return this.send(
            WS_EVENTS.TYPING_STOP,
            {
                conversationId
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Broadcasts
    |--------------------------------------------------------------------------
    */

    markBroadcastRead(
        broadcastId
    ) {
        return this.send(
            WS_EVENTS.ADMIN_BROADCAST_READ,
            {
                broadcastId
            }
        );
    }
}


const websocketManager =
    new WebSocketManager();


export default websocketManager;