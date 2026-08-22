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
    changePasswordController,
    registerE2EEPublicKeyController
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
import authRateLimiter from "../middleware/rateLimit.middleware.js";
const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/verify-email",
    authRateLimiter,
    validate(verifyEmailSchema),
    verifyEmail
);

router.post(
    "/resend-verification",
    authRateLimiter,
    validate(resendVerificationSchema),
    resendVerificationOTP
);

router.post(
    "/login",
    authRateLimiter,
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
    authRateLimiter,
    validate(forgotPasswordSchema),
    forgotPasswordController
);

router.post(
    "/reset-password",
    authRateLimiter,
    validate(resetPasswordSchema),
    resetPasswordController
);

router.post(
    "/change-password",
    authMiddleware,
    validate(changePasswordSchema),
    changePasswordController
);

router.post(
    "/e2ee/public-key",
    authMiddleware,
    registerE2EEPublicKeyController
);

export default router;