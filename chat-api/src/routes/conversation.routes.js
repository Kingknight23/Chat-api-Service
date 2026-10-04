import express from "express";

import {
    conversations,
    conversation
} from "../controllers/conversation.controller.js";


const router = express.Router();


router.get(
    "/",
    conversations
);


router.get(
    "/:conversationId",
    conversation
);


export default router;