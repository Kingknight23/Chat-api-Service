import express from "express";

import {
    create,
    addMember,
    removeMember,
    leave
} from "../controllers/group.controller.js";


const router =
    express.Router();


router.post(
    "/",
    create
);


router.post(
    "/:conversationId/members",
    addMember
);


router.delete(
    "/:conversationId/members/:userId",
    removeMember
);


router.post(
    "/:conversationId/leave",
    leave
);


export default router;