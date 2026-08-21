import {
    createProject,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getAllProjects,
    getProjectE2EEKeys
} from "../../services/project/project.service.js";

const createProjectController = async(req, res, next) => {
    try {
        const project = await createProject(
            req.user.userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });
    } catch (error) {
        next(error);
    }
};
const getMyProjectsController = async(req, res, next) => {
    try {
        const projects = await getMyProjects(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};


const getProjectByIdController = async(req, res, next) => {
    try {
        const project = await getProjectById(
            req.params.projectId
        );

        return res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

const updateProjectController = async(req, res, next) => {
    try {
        const project = await updateProject(
            req.params.projectId,
            req.user.userId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project
        });
    } catch (error) {
        next(error);
    }
};


const deleteProjectController = async(req, res, next) => {
    try {
        const result = await deleteProject(
            req.params.projectId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAllProjectsController = async(req, res, next) => {
    try {
        const result = await getAllProjects({
            search: req.query.search,
            skill: req.query.skill,
            page: req.query.page,
            limit: req.query.limit,
            sort: req.query.sort
        });

        return res.status(200).json({
            success: true,
            count: result.projects.length,
            data: result.projects,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


const getProjectE2EEKeysController = async(
    req,
    res,
    next
) => {
    try {
        const keys = await getProjectE2EEKeys({
            projectId: req.params.projectId,
            userId: req.user.userId
        });

        return res.status(200).json({
            success: true,
            data: keys
        });
    } catch (error) {
        next(error);
    }
};
export {
    createProjectController,
    getMyProjectsController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController,
    getAllProjectsController,
    getProjectE2EEKeysController
};