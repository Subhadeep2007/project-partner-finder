import Notification from "../../models/notification.js";
import { getIO } from "../../socket/socket.js";

const createNotification = async({
    recipient,
    sender = null,
    type,
    title,
    message,
    project = null
}) => {
    // 1. Save notification in MongoDB
    const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        project
    });

    // 2. Populate data before real-time emit
    await notification.populate(
        "sender",
        "name profileImage"
    );

    await notification.populate(
        "project",
        "title"
    );

    // 3. Send real-time notification
    try {
        const io = getIO();

        io.to(
            `user:${recipient.toString()}`
        ).emit(
            "new_notification",
            notification
        );
    } catch (error) {
        // Notification is already saved in DB.
        // Socket failure should not break the main action.
        console.error(
            "Real-time notification emit failed:",
            error.message
        );
    }

    return notification;
};


const getMyNotifications = async({
    userId,
    page = 1,
    limit = 20
}) => {
    const pageNumber = Math.max(
        parseInt(page) || 1,
        1
    );

    const limitNumber = Math.min(
        Math.max(parseInt(limit) || 20, 1),
        100
    );

    const skip =
        (pageNumber - 1) * limitNumber;

    const filter = {
        recipient: userId
    };

    const [notifications, totalNotifications] =
    await Promise.all([
        Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate(
            "sender",
            "name profileImage"
        )
        .populate(
            "project",
            "title"
        ),

        Notification.countDocuments(filter)
    ]);

    const unreadCount =
        await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

    return {
        notifications,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            totalNotifications,
            totalPages: Math.ceil(
                totalNotifications / limitNumber
            )
        },
        unreadCount
    };
};


const markNotificationAsRead = async({
    notificationId,
    userId
}) => {
    const notification =
        await Notification.findOne({
            _id: notificationId,
            recipient: userId
        });

    if (!notification) {
        throw new Error(
            "Notification not found"
        );
    }

    if (!notification.isRead) {
        notification.isRead = true;
        await notification.save();
    }

    return notification;
};


const markAllNotificationsAsRead = async(
    userId
) => {
    await Notification.updateMany({
        recipient: userId,
        isRead: false
    }, {
        $set: {
            isRead: true
        }
    });

    return {
        success: true
    };
};


export {
    createNotification,
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};