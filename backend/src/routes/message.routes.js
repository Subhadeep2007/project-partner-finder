import express from "express";

import {
    getProjectMessagesController
} from "../controllers/message/message.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    "/projects/:projectId/messages",
    authMiddleware,
    getProjectMessagesController
);

export default router;