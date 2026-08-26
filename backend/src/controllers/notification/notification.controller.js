import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    sendComeOnlineRequest
} from "../../services/notification/notification.service.js";


const getMyNotificationsController = async(
    req,
    res,
    next
) => {
    try {
        const result =
            await getMyNotifications({
                userId: req.user.userId,
                page: req.query.page,
                limit: req.query.limit
            });

        return res.status(200).json({
            success: true,
            data: result.notifications,
            pagination: result.pagination,
            unreadCount: result.unreadCount
        });
    } catch (error) {
        next(error);
    }
};


const markNotificationAsReadController = async(
    req,
    res,
    next
) => {
    try {
        const notification =
            await markNotificationAsRead({
                notificationId: req.params.notificationId,

                userId: req.user.userId
            });

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification
        });
    } catch (error) {
        next(error);
    }
};


const markAllNotificationsAsReadController =
    async(
        req,
        res,
        next
    ) => {
        try {
            await markAllNotificationsAsRead(
                req.user.userId
            );

            return res.status(200).json({
                success: true,
                message: "All notifications marked as read"
            });
        } catch (error) {
            next(error);
        }
    };
const deleteNotificationController =
    async(
        req,
        res,
        next
    ) => {

        try {

            const result =
                await deleteNotification({

                    notificationId: req.params.notificationId,

                    userId: req.user.userId

                });


            return res.status(200).json({

                success: true,

                message: "Notification deleted successfully",

                data: result

            });

        } catch (error) {

            next(error);

        }

    };
const sendComeOnlineRequestController =
    async(
        req,
        res,
        next
    ) => {

        try {

            const notification =
                await sendComeOnlineRequest({

                    projectId: req.body.projectId,

                    memberId: req.body.memberId,

                    senderId: req.user.userId

                });


            return res.status(201).json({

                success: true,

                message: "Come online notification sent successfully",

                data: notification

            });

        } catch (error) {

            next(error);

        }

    };
export {
    getMyNotificationsController,
    markNotificationAsReadController,
    markAllNotificationsAsReadController,
    deleteNotificationController,
    sendComeOnlineRequestController
};