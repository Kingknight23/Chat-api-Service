import {
    handleSendMessage
} from "./handlers/message.handler.js";

import {
    handleSubscribe,
    handleUnsubscribe
} from "./handlers/conversation.handler.js";

import {
    handlePresence
} from "./handlers/presence.handler.js";

const routeMessage = async (socket, message) => {
    try {
        switch (message.type) {
            case "message.send":
                await handleSendMessage(socket, message);
                break;

            case "conversation.subscribe":
                await handleSubscribe(socket, message);
                break;

            case "conversation.unsubscribe":
                await handleUnsubscribe(socket, message);
                break;

            case "presence.update":
                await handlePresence(socket, message);
                break;

            default:
                socket.send(
                    JSON.stringify({
                        type: "error",
                        data: {
                            message: "Unknown WebSocket event"
                        }
                    })
                );
        }
    } catch (error) {
        console.error(error);

        socket.send(
            JSON.stringify({
                type: "error",
                data: {
                    message: error.message
                }
            })
        );
    }
};

export default routeMessage;