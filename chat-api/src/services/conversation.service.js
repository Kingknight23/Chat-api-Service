import mongoose from "mongoose";

import Conversation from "../models/Conversation.js";
import ConversationMember from "../models/ConversationMember.js";
import Message from "../models/Message.js";


const getConversations = async (userId) => {
    const memberships = await ConversationMember.find({
        userId
    }).sort({
        joinedAt: -1
    });

    const conversations = [];

    for (const membership of memberships) {
        const conversation =
            await Conversation.findById(
                membership.conversationId
            );

        if (!conversation) {
            continue;
        }

        const members =
            await ConversationMember.find({
                conversationId: conversation._id
            });

        const lastMessage =
            await Message.findOne({
                conversationId: conversation._id
            }).sort({
                createdAt: -1
            });

        conversations.push({
            conversation,
            members,
            lastMessage
        });
    }

    return conversations;
};


const getConversation = async (
    userId,
    conversationId
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

    const conversation =
        await Conversation.findById(
            conversationId
        );

    if (!conversation) {
        throw new Error(
            "Conversation not found"
        );
    }

    const members =
        await ConversationMember.find({
            conversationId
        });

    return {
        conversation,
        members
    };
};


export {
    getConversations,
    getConversation
};