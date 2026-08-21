import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import chatUpload from "../middleware/upload.middleware.js";

import {
    uploadChatFileController
} from "../controllers/message/messageUpload.controller.js";

const router = express.Router();

router.post(
    "/projects/:projectId/messages/upload",
    authMiddleware,
    chatUpload.single("file"),
    uploadChatFileController
);

export default router;