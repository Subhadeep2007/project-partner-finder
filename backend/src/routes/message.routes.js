import express from "express";

import {
    getProjectMessagesController,
    getUnreadCountController
} from "../controllers/message/message.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();


router.get(
    "/projects/:projectId/messages",
    authMiddleware,
    getProjectMessagesController
);


router.get(
    "/projects/:projectId/unread-count",
    authMiddleware,
    getUnreadCountController
);


export default router;