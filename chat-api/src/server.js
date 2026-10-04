import http from "http";

import app from "./app.js";
import env from "./config/env.js";
import connectDatabase from "./config/database.js";
import setupWebSocket from "./websocket/websocket.server.js";

const startServer = async () => {
    await connectDatabase();

    const server = http.createServer(app);

    setupWebSocket(server);

    server.listen(env.port, () => {
        console.log(
            `Chat API running on port ${env.port}`
        );

        console.log(
            `WebSocket running on ws://localhost:${env.port}/ws`
        );
    });
};

startServer();