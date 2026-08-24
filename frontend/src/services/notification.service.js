import api from "../api/axios";


const getMyNotifications = async(
    page = 1,
    limit = 20
) => {

    const response = await api.get(
        `/notifications?page=${page}&limit=${limit}`
    );

    return response.data;

};


const markNotificationAsRead = async(
    notificationId
) => {

    const response = await api.patch(
        `/notifications/${notificationId}/read`
    );

    return response.data;

};


const markAllNotificationsAsRead = async() => {

    const response = await api.patch(
        "/notifications/read-all"
    );

    return response.data;

};


export {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};