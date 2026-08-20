import express from "express";

import {
    createProjectController,
    getMyProjectsController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController
} from "../controllers/project/project.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
    createProjectSchema,
    updateProjectSchema
} from "../validators/project.validator.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(createProjectSchema),
    createProjectController
);

router.get(
    "/my",
    authMiddleware,
    getMyProjectsController
);
router.get(
    "/:projectId",
    authMiddleware,
    getProjectByIdController
);

router.patch(
    "/:projectId",
    authMiddleware,
    validate(updateProjectSchema),
    updateProjectController
);

router.delete(
    "/:projectId",
    authMiddleware,
    deleteProjectController
);
export default router;