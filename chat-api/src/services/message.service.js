import mongoose from "mongoose";

import Message from "../models/Message.js";
import ConversationMember from "../models/ConversationMember.js";

import {
    decryptMessageForUser
} from "./encryption.service.js";


const getMessages = async (
    userId,
    conversationId,
    limit = 50,
    before = null
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            conversationId
        )
    ) {
        throw new Error(
            "Invalid conversation ID"
        );
    }

    const member =
        await ConversationMember.findOne({
            conversationId,
            userId
        });

    if (!member) {
        throw new Error(
            "You are not a member of this conversation"
        );
    }

    const query = {
        conversationId
    };

    if (before) {
        if (
            !mongoose.Types.ObjectId.isValid(
                before
            )
        ) {
            throw new Error(
                "Invalid message ID"
            );
        }

        const beforeMessage =
            await Message.findById(before);

        if (!beforeMessage) {
            throw new Error(
                "Message not found"
            );
        }

        query.createdAt = {
            $lt: beforeMessage.createdAt
        };
    }

    const messages =
        await Message.find(query)
            .sort({
                createdAt: -1
            })
            .limit(Number(limit));

    const decryptedMessages = [];

    for (
        const message of messages
    ) {
        let payload;

        /*
         * Try to decrypt encrypted messages.
         */
        if (
            message.payload &&
            message.payload.encryptedKeys
        ) {
            payload =
                await decryptMessageForUser(
                    message.payload,
                    userId
                );
        } else {
            /*
             * This allows old plaintext
             * development messages to still
             * be returned.
             */
            payload =
                message.payload;
        }

        decryptedMessages.push({
            _id: message._id,

            conversationId:
                message.conversationId,

            senderId:
                message.senderId,

            messageType:
                message.messageType,

            payloadType:
                message.payloadType,

            payload,

            createdAt:
                message.createdAt
        });
    }

    /*
     * Messages are retrieved newest-first,
     * so reverse them for the client.
     */
    return decryptedMessages.reverse();
};


export {
    getMessages
};