import Message from "../../models/Message.js";
import ConversationMember from "../../models/ConversationMember.js";

import {
    validatePayload
} from "../../payloads/registry.js";

import {
    encryptMessageForUsers,
    decryptMessageForUser
} from "../../services/encryption.service.js";

import {
    broadcastToUsers,
    sendToUser
} from "../connection.manager.js";


const handleSendMessage = async (
    socket,
    message
) => {
    const {
        conversationId,
        payloadType,
        payload
    } = message.data || {};

    if (!conversationId) {
        throw new Error(
            "conversationId is required"
        );
    }

    if (!payloadType) {
        throw new Error(
            "payloadType is required"
        );
    }

    if (payload === undefined) {
        throw new Error(
            "payload is required"
        );
    }

    /*
     * Verify sender membership.
     */
    const member =
        await ConversationMember.findOne({
            conversationId,
            userId: socket.user.userId
        });

    if (!member) {
        throw new Error(
            "You are not a member of this conversation"
        );
    }

    /*
     * Validate payload.
     */
    const validatedPayload =
        validatePayload(
            payloadType,
            payload
        );

    let messageType = "CUSTOM";

    if (payloadType === "text") {
        messageType = "TEXT";
    }

    if (payloadType === "image") {
        messageType = "IMAGE";
    }

    /*
     * Get conversation members.
     */
    const members =
        await ConversationMember.find({
            conversationId
        });

    const userIds =
        members.map(
            (member) =>
                member.userId
        );

    /*
     * Encrypt the message.
     */
    const encryptedPayload =
        await encryptMessageForUsers(
            validatedPayload,
            userIds
        );

    /*
     * Store encrypted message.
     */
    const newMessage =
        await Message.create({
            conversationId,

            senderId:
                socket.user.userId,

            messageType,

            payloadType,

            payload:
                encryptedPayload
        });

    /*
     * Send the message individually
     * to each online conversation member.
     */
    for (
        const userId of userIds
    ) {
        try {
            const decryptedPayload =
                await decryptMessageForUser(
                    encryptedPayload,
                    userId
                );

            sendToUser(
                userId,
                {
                    type:
                        "message.created",

                    data: {
                        messageId:
                            newMessage._id,

                        conversationId,

                        senderId:
                            socket.user.userId,

                        messageType,

                        payloadType,

                        payload:
                            decryptedPayload,

                        createdAt:
                            newMessage.createdAt
                    }
                }
            );
        } catch (error) {
            console.error(
                `Could not decrypt message for ${userId}:`,
                error.message
            );
        }
    }
};


export {
    handleSendMessage
};