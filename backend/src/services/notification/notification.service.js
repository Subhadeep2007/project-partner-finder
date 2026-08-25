import Notification from "../../models/notification.js";
import { getIO } from "../../socket/socket.js";


// ==========================================
// CREATE NOTIFICATION
// ==========================================

const createNotification = async({
    recipient,
    sender = null,
    type,
    title,
    message,
    project = null
}) => {

    // ==========================================
    // 1. SAVE NOTIFICATION
    // ==========================================

    const notification =
        await Notification.create({

            recipient,

            sender,

            type,

            title,

            message,

            project

        });


    // ==========================================
    // 2. POPULATE SENDER
    // ==========================================

    await notification.populate(
        "sender",
        `
            name
            profileImage
            bio
            location
            college
            course
            graduationYear
            skills
            experienceLevel
            interests
            github
            linkedin
            portfolio
        `
    );


    // ==========================================
    // 3. POPULATE PROJECT
    // ==========================================

    await notification.populate({

        path: "project",

        select: `
                title
                description
                requiredSkills
                teamSize
                status
                owner
                members
                createdAt
            `,

        populate: {

            path: "owner",

            select: `
                    name
                    profileImage
                    bio
                    location
                    college
                    course
                    graduationYear
                    skills
                    experienceLevel
                    interests
                    github
                    linkedin
                    portfolio
                `

        }

    });


    // ==========================================
    // 4. REAL-TIME NOTIFICATION
    // ==========================================

    try {

        const io =
            getIO();


        io.to(
            `user:${recipient.toString()}`
        ).emit(
            "new_notification",
            notification
        );


    } catch (error) {

        console.error(
            "Real-time notification emit failed:",
            error.message
        );

    }


    return notification;

};


// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

const getMyNotifications = async({
    userId,
    page = 1,
    limit = 20
}) => {

    // ==========================================
    // PAGINATION
    // ==========================================

    const pageNumber =
        Math.max(
            parseInt(page) || 1,
            1
        );


    const limitNumber =
        Math.min(
            Math.max(
                parseInt(limit) || 20,
                1
            ),
            100
        );


    const skip =
        (pageNumber - 1) *
        limitNumber;


    // ==========================================
    // ONLY ACTIVE NOTIFICATIONS
    // ==========================================

    const filter = {

        recipient: userId,

        deletedAt: null

    };


    // ==========================================
    // FETCH DATA
    // ==========================================

    const [
        notifications,
        totalNotifications,
        unreadCount
    ] = await Promise.all([


        // ======================================
        // NOTIFICATIONS
        // ======================================

        Notification.find(
            filter
        )

        .sort({
            createdAt:
                -1
        })

        .skip(
            skip
        )

        .limit(
            limitNumber
        )


        // ======================================
        // SENDER
        // ======================================

        .populate(
            "sender",
            `
                name
                profileImage
                bio
                location
                college
                course
                graduationYear
                skills
                experienceLevel
                interests
                github
                linkedin
                portfolio
            `
        )


        // ======================================
        // PROJECT + OWNER
        // ======================================

        .populate({

            path: "project",

            select: `
                    title
                    description
                    requiredSkills
                    teamSize
                    status
                    owner
                    members
                    createdAt
                `,

            populate: {

                path: "owner",

                select: `
                        name
                        profileImage
                        bio
                        location
                        college
                        course
                        graduationYear
                        skills
                        experienceLevel
                        interests
                        github
                        linkedin
                        portfolio
                    `

            }

        }),


        // ======================================
        // TOTAL ACTIVE NOTIFICATIONS
        // ======================================

        Notification.countDocuments(
            filter
        ),


        // ======================================
        // UNREAD ACTIVE NOTIFICATIONS
        // ======================================

        Notification.countDocuments({

            recipient: userId,

            isRead: false,

            deletedAt: null

        })

    ]);


    return {

        notifications,

        pagination: {

            page: pageNumber,

            limit: limitNumber,

            totalNotifications,

            totalPages: Math.ceil(
                totalNotifications /
                limitNumber
            )

        },

        unreadCount

    };

};


// ==========================================
// MARK SINGLE NOTIFICATION AS READ
// ==========================================

const markNotificationAsRead = async({
    notificationId,
    userId
}) => {

    const notification =
        await Notification.findOne({

            _id: notificationId,

            recipient: userId,

            deletedAt: null

        });


    if (!notification) {

        throw new Error(
            "Notification not found"
        );

    }


    if (!notification.isRead) {

        notification.isRead =
            true;


        await notification.save();

    }


    return notification;

};


// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

const markAllNotificationsAsRead = async(
    userId
) => {

    await Notification.updateMany(

        {

            recipient: userId,

            isRead: false,

            deletedAt: null

        },

        {

            $set: {

                isRead: true

            }

        }

    );


    return {

        success: true

    };

};


// ==========================================
// SOFT DELETE NOTIFICATION
// ==========================================

const deleteNotification = async({
    notificationId,
    userId
}) => {

    // ==========================================
    // FIND ONLY CURRENT USER'S ACTIVE NOTIFICATION
    // ==========================================

    const notification =
        await Notification.findOne({

            _id: notificationId,

            recipient: userId,

            deletedAt: null

        });


    if (!notification) {

        throw new Error(
            "Notification not found"
        );

    }


    // ==========================================
    // SOFT DELETE
    // ==========================================

    notification.deletedAt =
        new Date();


    await notification.save();


    return {

        notificationId: notification._id,

        deletedAt: notification.deletedAt

    };

};


// ==========================================
// EXPORT
// ==========================================

export {

    createNotification,

    getMyNotifications,

    markNotificationAsRead,

    markAllNotificationsAsRead,

    deleteNotification

};