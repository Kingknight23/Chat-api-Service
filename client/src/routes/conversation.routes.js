import express from "express";

import {
    conversations,
    conversation,
    openDirect
} from "../controllers/conversation.controller.js";


const router = express.Router();


router.get(
    "/",
    conversations
);

router.post(
    "/direct",
    openDirect
);


router.get(
    "/:conversationId",
    conversation
);


export default router;