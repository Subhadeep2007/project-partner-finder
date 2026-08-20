import Project from "../../models/project.js";

const createProject = async(userId, projectData) => {
    const project = await Project.create({
        title: projectData.title,
        description: projectData.description,
        requiredSkills: projectData.requiredSkills,
        teamSize: projectData.teamSize,

        owner: userId
    });

    return project;
};


const getMyProjects = async(userId) => {
    const projects = await Project.find({
            owner: userId
        })
        .sort({ createdAt: -1 });

    return projects;
};


const getProjectById = async(projectId) => {
    const project = await Project.findById(projectId)
        .populate(
            "owner",
            "name profileImage skills"
        );

    if (!project) {
        throw new Error("Project not found");
    }

    return project;
};


const updateProject = async(
    projectId,
    userId,
    updateData
) => {
    // 1. Project find karo
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Check owner
    if (project.owner.toString() !== userId) {
        throw new Error(
            "You are not authorized to update this project"
        );
    }

    // 3. Allowed fields only update
    if (updateData.title !== undefined) {
        project.title = updateData.title;
    }

    if (updateData.description !== undefined) {
        project.description = updateData.description;
    }

    if (updateData.requiredSkills !== undefined) {
        project.requiredSkills = updateData.requiredSkills;
    }

    if (updateData.teamSize !== undefined) {
        project.teamSize = updateData.teamSize;
    }

    // 4. Save
    await project.save();

    return project;
};


const deleteProject = async(projectId, userId) => {
    // 1. Find project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Check project owner
    if (project.owner.toString() !== userId) {
        throw new Error(
            "You are not authorized to delete this project"
        );
    }

    // 3. Delete project
    await project.deleteOne();

    return {
        projectId
    };
};

export {
    createProject,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject
};