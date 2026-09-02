import express from "express";

import {
    getProjectMessagesController,
    getUnreadCountController,
    deleteMessageForMeController,
    deleteMessageForEveryoneController,
    addEncryptedKeyForUserController,
    editMessageController,

} from "../controllers/message/message.controller.js";
import {
    uploadChatFileController
} from "../controllers/message/messageUpload.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import chatUpload from "../middleware/chatUpload.middleware.js";
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
router.post(
    "/projects/:projectId/messages/upload",
    authMiddleware,
    chatUpload.single("file"),
    uploadChatFileController
);

// Delete message only for current user

router.delete(
    "/messages/:messageId/delete-for-me",
    authMiddleware,
    deleteMessageForMeController
);

router.patch(
    "/messages/:messageId",
    authMiddleware,
    editMessageController
);
// Delete message for everyone
// Service automatically checks that
// only the original sender can do this

router.delete(
    "/messages/:messageId/delete-for-everyone",
    authMiddleware,
    deleteMessageForEveryoneController
);
router.post(
    "/projects/:projectId/messages/:messageId/e2ee-key",
    authMiddleware,
    addEncryptedKeyForUserController
);

export default router;