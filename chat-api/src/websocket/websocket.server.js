import { WebSocketServer } from "ws";

import routeMessage from "./router.js";

import {
    addConnection,
    removeConnection
} from "./connection.manager.js";

import {
    startHeartbeat,
    startHeartbeatInterval
} from "./heartbeat.js";

const setupWebSocket = (server) => {
    const webSocketServer = new WebSocketServer({
        server,
        path: "/ws"
    });

    webSocketServer.on("connection", (socket, request) => {
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

        socket.user = {
            userId: token,
            roles: ["USER"]
        };

        socket.subscriptions = new Set();

        addConnection(
            socket.user.userId,
            socket
        );

        startHeartbeat(socket);

        socket.send(
            JSON.stringify({
                type: "connection.ready",
                data: {
                    userId: socket.user.userId
                }
            })
        );

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