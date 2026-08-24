import api from "../api/axios";


const getMyProjects = async() => {

    const response =
        await api.get("/projects/my");

    return response.data;

};


const getAllProjects = async(
    params = {}
) => {

    const response =
        await api.get(
            "/projects", {
                params
            }
        );

    return response.data;

};


const getProjectById = async(
    projectId
) => {

    const response =
        await api.get(
            `/projects/${projectId}`
        );

    return response.data;

};


const createProject = async(
    projectData
) => {

    const response =
        await api.post(
            "/projects",
            projectData
        );

    return response.data;

};


const updateProject = async(
    projectId,
    projectData
) => {

    const response =
        await api.patch(
            `/projects/${projectId}`,
            projectData
        );

    return response.data;

};


const updateProjectStatus = async(
    projectId,
    status
) => {

    const response =
        await api.patch(
            `/projects/${projectId}/status`, {
                status
            }
        );

    return response.data;

};


const deleteProject = async(
    projectId
) => {

    const response =
        await api.delete(
            `/projects/${projectId}`
        );

    return response.data;

};


const sendJoinRequest = async(
    projectId
) => {

    const response =
        await api.post(
            `/projects/${projectId}/join-request`
        );

    return response.data;

};


// GET E2EE public keys
// of project owner and members

const getProjectE2EEKeys = async(
    projectId
) => {

    const response =
        await api.get(
            `/projects/${projectId}/e2ee-keys`
        );

    return response.data;

};


export {
    getMyProjects,
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    sendJoinRequest,
    getProjectE2EEKeys
};