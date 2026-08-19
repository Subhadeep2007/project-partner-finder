import express from "express";

import { register, verifyEmail, resendVerificationOTP, login, refreshToken } from "../controllers/auth/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, verifyEmailSchema, resendVerificationSchema, loginSchema } from "../validators/auth.validator.js";

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
export default router;