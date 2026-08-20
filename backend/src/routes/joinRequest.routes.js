import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
    sendJoinRequestController,
    getIncomingJoinRequestsController,
    acceptJoinRequestController,
    rejectJoinRequestController,
    leaveProjectController
} from "../controllers/joinRequest/joinRequest.controller.js";

const router = express.Router();

router.post(
    "/projects/:projectId/join-request",
    authMiddleware,
    sendJoinRequestController
);
router.get(
    "/join-requests/incoming",
    authMiddleware,
    getIncomingJoinRequestsController
);

router.patch(
    "/join-requests/:requestId/accept",
    authMiddleware,
    acceptJoinRequestController
);

router.patch(
    "/join-requests/:requestId/reject",
    authMiddleware,
    rejectJoinRequestController
);

router.patch(
    "/projects/:projectId/leave",
    authMiddleware,
    leaveProjectController
);
export default router;