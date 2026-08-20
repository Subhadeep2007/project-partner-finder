import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import {
    getMyProfile,
    updateProfile,
    uploadProfileImageController,
    addSkillController,
    removeSkillController
} from "../controllers/user/user.controller.js";
import validate from "../middleware/validate.middleware.js";

import upload from "../middleware/upload.middleware.js";
import {
    updateProfileSchema,
    addSkillSchema
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

router.post(
    "/me/skills",
    authMiddleware,
    validate(addSkillSchema),
    addSkillController
);

router.delete(
    "/me/skills/:skill",
    authMiddleware,
    removeSkillController
);

export default router;