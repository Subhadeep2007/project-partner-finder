import express from "express";

import {
    createProjectController,
    getMyProjectsController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController,
    getAllProjectsController,
    getProjectE2EEKeysController
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
    "/:projectId/e2ee-keys",
    authMiddleware,
    getProjectE2EEKeysController
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

router.get(
    "/",
    authMiddleware,
    getAllProjectsController
);
export default router;