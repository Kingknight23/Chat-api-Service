import { WebSocketServer } from "ws";

import routeMessage from "./router.js";

import {
    addConnection,
    removeConnection,
    isUserOnline,
    getOnlineUserIds,
    broadcastToUsers
} from "./connection.manager.js";

import {
    startHeartbeat,
    startHeartbeatInterval
} from "./heartbeat.js";

import {sendRecentBroadcasts} from "../services/broadcast.service.js";


const setupWebSocket = (server) => {
    const webSocketServer = new WebSocketServer({
        server,
        path: "/ws"
    });

    webSocketServer.on("connection", async (socket, request) => {
        /*
         * Authentication will come from your
         * authentication service.
         *
         * For now we use a token from:
         *
         * ws://localhost:5000/ws?token=USER_ID
         */

        const url = new URL(
            request.url,
            `http://${request.headers.host}`
        );

        const token = url.searchParams.get("token");

        if (!token) {
            socket.close(1008, "Authentication required");
            return;
        }

        /*
         * TEMPORARY:
         * Replace this with actual token verification.
         */

        // socket.user = {
        //     userId: token,
        //     roles: ["USER"]
        // };
        if (token === "admin") {
            socket.user = {
                userId: "admin",
                roles: ["ADMIN"]
            };

        } else {

            socket.user = {
                userId: token,
                roles: ["USER"]
            };
        }

        socket.subscriptions = new Set();

        const wasAlreadyOnline =
        isUserOnline(
            socket.user.userId
        );

        addConnection(
            socket.user.userId,
            socket
        );

        if (!wasAlreadyOnline) {
            broadcastToUsers(
                getOnlineUserIds(),
                {
                    type:
                        "presence.online",

                    data: {
                        userId:
                            socket.user.userId
                    }
                }
            );
        }

        

        startHeartbeat(socket);

        socket.send(
            JSON.stringify({
                type: "connection.ready",
                data: {
                    userId: socket.user.userId
                }
            })
        );

        try {
            await sendRecentBroadcasts(
                socket.user.userId
            );
        } catch (error) {
            console.error(
                "Could not send unread broadcasts:",
                error.message
            );
        }

        socket.on("message", async (rawMessage) => {
            try {
                const message = JSON.parse(
                    rawMessage.toString()
                );

                await routeMessage(
                    socket,
                    message
                );
            } catch (error) {
                socket.send(
                    JSON.stringify({
                        type: "error",
                        data: {
                            message:
                                "Invalid WebSocket message"
                        }
                    })
                );
            }
        });

        socket.on("close", () => {

            removeConnection(
                socket.user.userId,
                socket
            );
            /*
            * Only announce offline when
            * the user has no other tabs/devices.
            */

            if (
                !isUserOnline(
                    socket.user.userId
                )
            ) {

                broadcastToUsers(
                    getOnlineUserIds(),

                    {
                        type:
                            "presence.offline",

                        data: {
                            userId:
                                socket.user.userId
                        }
                    }
                );
            }
        });

        socket.on("error", () => {
            removeConnection(
                socket.user.userId,
                socket
            );
        });
    });

    startHeartbeatInterval(webSocketServer);

    console.log("WebSocket server ready");
};

export default setupWebSocket;