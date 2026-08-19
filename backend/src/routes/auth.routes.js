import express from "express";

import {
    register,
    verifyEmail,
    resendVerificationOTP,
    login,
    refreshToken,
    logout,
    forgotPasswordController,
    resetPasswordController,
    changePasswordController
} from "../controllers/auth/auth.controller.js";

import validate from "../middleware/validate.middleware.js";

import {
    registerSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} from "../validators/auth.validator.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/verify-email",
    validate(verifyEmailSchema),
    verifyEmail
);

router.post(
    "/resend-verification",
    validate(resendVerificationSchema),
    resendVerificationOTP
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.post(
    "/refresh-token",
    refreshToken
);

router.post(
    "/logout",
    logout
);

router.post(
    "/forgot-password",
    validate(forgotPasswordSchema),
    forgotPasswordController
);

router.post(
    "/reset-password",
    validate(resetPasswordSchema),
    resetPasswordController
);

router.post(
    "/change-password",
    authMiddleware,
    validate(changePasswordSchema),
    changePasswordController
);

export default router;