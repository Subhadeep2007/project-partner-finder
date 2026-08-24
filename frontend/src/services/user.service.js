import api from "../api/axios";


const getMyProfile = async() => {

    const response = await api.get(
        "/users/me"
    );

    return response.data;

};


const updateMyProfile = async(profileData) => {

    const response = await api.put(
        "/users/me",
        profileData
    );

    return response.data;

};


const uploadProfileImage = async(formData) => {

    const response = await api.post(
        "/users/me/profile-image",
        formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;

};


const addSkill = async(skill) => {

    const response = await api.post(
        "/users/me/skills", {
            skill
        }
    );

    return response.data;

};


const removeSkill = async(skill) => {

    const response = await api.delete(
        `/users/me/skills/${encodeURIComponent(skill)}`
    );

    return response.data;

};


const getPublicProfile = async(userId) => {

    const response = await api.get(
        `/users/${userId}`
    );

    return response.data;

};


const searchUsers = async(params = {}) => {

    const response = await api.get(
        "/users/search", {
            params
        }
    );

    return response.data;

};


export {
    getMyProfile,
    updateMyProfile,
    uploadProfileImage,
    addSkill,
    removeSkill,
    getPublicProfile,
    searchUsers
};