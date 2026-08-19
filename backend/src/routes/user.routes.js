import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import { getMyProfile, updateProfile, uploadProfileImageController } from "../controllers/user/user.controller.js";
import validate from "../middleware/validate.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.middleware.js";
import {
    updateProfileSchema
} from "../validators/user.validator.js";
const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    getMyProfile
);
router.put(
    "/me",
    authMiddleware,
    validate(updateProfileSchema),
    updateProfile
);

router.post(
    "/me/profile-image",
    authMiddleware,
    upload.single("profileImage"),
    uploadProfileImageController
);

export default router;