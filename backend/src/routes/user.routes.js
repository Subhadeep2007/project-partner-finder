import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import { getMyProfile } from "../controllers/user/user.controller.js";

const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    getMyProfile
);

export default router;