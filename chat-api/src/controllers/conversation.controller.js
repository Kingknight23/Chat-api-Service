import {
    getConversations,
    getConversation
} from "../services/conversation.service.js";


const conversations = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.userId;

        const result =
            await getConversations(
                userId
            );

        res.status(200).json({
            conversations: result
        });
    } catch (error) {
        next(error);
    }
};


const conversation = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.userId;

        const {
            conversationId
        } = req.params;

        const result =
            await getConversation(
                userId,
                conversationId
            );

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


export {
    conversations,
    conversation
};