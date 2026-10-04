import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },

        senderId: {
            type: String,
            required: true
        },

        messageType: {
            type: String,
            enum: ["TEXT", "IMAGE", "FILE", "CUSTOM"],
            default: "TEXT"
        },

        payloadType: {
            type: String,
            required: true
        },

        payload: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    {
        timestamps: true
    }
);

messageSchema.index({
    conversationId: 1,
    createdAt: -1
});

const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;