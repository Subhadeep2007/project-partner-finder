import express from "express";

import { register } from "../controllers/auth/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

export default router;