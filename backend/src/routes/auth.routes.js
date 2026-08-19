import express from "express";

import { register, verifyEmail, resendVerificationOTP } from "../controllers/auth/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, verifyEmailSchema, resendVerificationSchema } from "../validators/auth.validator.js";

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
export default router;