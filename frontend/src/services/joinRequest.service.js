import api from "../api/axios";


const sendJoinRequest = async(projectId) => {

    const response = await api.post(
        `/projects/${projectId}/join-request`
    );

    return response.data;

};


const getIncomingJoinRequests = async() => {

    const response = await api.get(
        "/join-requests/incoming"
    );

    return response.data;

};


const acceptJoinRequest = async(requestId) => {

    const response = await api.patch(
        `/join-requests/${requestId}/accept`
    );

    return response.data;

};


const rejectJoinRequest = async(requestId) => {

    const response = await api.patch(
        `/join-requests/${requestId}/reject`
    );

    return response.data;

};


const leaveProject = async(projectId) => {

    const response = await api.patch(
        `/projects/${projectId}/leave`
    );

    return response.data;

};


const removeProjectMember = async(
    projectId,
    memberId
) => {

    const response = await api.delete(
        `/projects/${projectId}/members/${memberId}`
    );

    return response.data;

};


export {
    sendJoinRequest,
    getIncomingJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    leaveProject,
    removeProjectMember
};