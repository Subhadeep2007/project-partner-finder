import api from "../api/axios";


const getProjectMessages = async(
    projectId,
    page = 1,
    limit = 30
) => {

    const response = await api.get(
        `/projects/${projectId}/messages`, {
            params: {
                page,
                limit
            }
        }
    );

    return response.data;
};


const getUnreadCount = async(
    projectId
) => {

    const response = await api.get(
        `/projects/${projectId}/unread-count`
    );

    return response.data;
};


const uploadChatFile = async(
    projectId,
    file
) => {

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    const response = await api.post(
        `/projects/${projectId}/messages/upload`,
        formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};


const deleteMessageForMe = async(
    messageId
) => {

    const response =
        await api.delete(
            `/messages/${messageId}/delete-for-me`
        );

    return response.data;

};


const deleteMessageForEveryone = async(
    messageId
) => {

    const response =
        await api.delete(
            `/messages/${messageId}/delete-for-everyone`
        );

    return response.data;

};
const addEncryptedKeyForUser =
    async(
        projectId,
        messageId,
        targetUserId,
        encryptedKey,
        keyVersion = 1
    ) => {

        const response =
            await api.post(

                `/projects/${projectId}/messages/${messageId}/e2ee-key`,

                {
                    targetUserId,
                    encryptedKey,
                    keyVersion
                }

            );


        return response.data;

    };
export {
    getProjectMessages,
    getUnreadCount,
    uploadChatFile,
    deleteMessageForMe,
    deleteMessageForEveryone,
    addEncryptedKeyForUser
};