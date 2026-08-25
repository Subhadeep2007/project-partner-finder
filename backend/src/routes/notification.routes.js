import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
    getMyNotificationsController,
    markNotificationAsReadController,
    markAllNotificationsAsReadController,
    deleteNotificationController

} from "../controllers/notification/notification.controller.js";

const router = express.Router();


// Get my notifications
router.get(
    "/",
    authMiddleware,
    getMyNotificationsController
);


// Mark all notifications as read
router.patch(
    "/read-all",
    authMiddleware,
    markAllNotificationsAsReadController
);
// Delete single notification
router.delete(
    "/:notificationId",
    authMiddleware,
    deleteNotificationController
);

// Mark single notification as read
router.patch(
    "/:notificationId/read",
    authMiddleware,
    markNotificationAsReadController
);


export default router;