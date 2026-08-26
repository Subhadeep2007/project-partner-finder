import Notification from "../../models/notification.js";
import { getIO } from "../../socket/socket.js";

import Project from "../../models/project.js";
import User from "../../models/user.js";
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
const sendComeOnlineRequest = async({
    projectId,
    memberId,
    senderId
}) => {

    // ==========================================
    // 1. SAME USER CHECK
    // ==========================================

    if (
        String(memberId) ===
        String(senderId)
    ) {

        throw new Error(
            "You cannot notify yourself"
        );

    }


    // ==========================================
    // 2. FIND PROJECT
    // ==========================================

    const project =
        await Project.findById(
            projectId
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    // ==========================================
    // 3. REQUESTER AUTHORIZATION
    // ==========================================

    const isOwner =
        String(project.owner) ===
        String(senderId);


    const isRequesterMember =
        project.members.some(
            (memberId) =>
            String(memberId) ===
            String(senderId)
        );


    if (!isOwner &&
        !isRequesterMember
    ) {

        throw new Error(
            "You are not a member of this project"
        );

    }


    // ==========================================
    // 4. TARGET MEMBER CHECK
    // ==========================================

    const isTargetMember =
        project.members.some(
            (memberId) =>
            String(memberId) ===
            String(memberId)
        );


    if (!isTargetMember) {

        throw new Error(
            "Target user is not a member of this project"
        );

    }


    // ==========================================
    // 5. CHECK TARGET USER
    // ==========================================

    const targetUser =
        await User.findById(
            memberId
        ).select(
            "name email"
        );


    if (!targetUser) {

        throw new Error(
            "Target user not found"
        );

    }


    // ==========================================
    // 6. CHECK TARGET ONLINE STATUS
    // ==========================================

    const io =
        getIO();


    const targetRoom =
        io.sockets.adapter.rooms.get(
            `user:${memberId}`
        );


    if (
        targetRoom &&
        targetRoom.size > 0
    ) {

        throw new Error(
            "This member is already online"
        );

    }


    // ==========================================
    // 7. PREVENT NOTIFICATION SPAM
    // ==========================================

    const cooldownTime =
        new Date(
            Date.now() -
            5 * 60 * 1000
        );


    const recentNotification =
        await Notification.findOne({

            recipient: memberId,

            sender: senderId,

            project: projectId,

            type: "come_online_request",

            deletedAt: null,

            createdAt: {
                $gte: cooldownTime
            }

        });


    if (recentNotification) {

        throw new Error(
            "A notification was already sent recently"
        );

    }


    // ==========================================
    // 8. CREATE DOMAIN NOTIFICATION
    // ==========================================

    const notification =
        await createNotification({

            recipient: memberId,

            sender: senderId,

            type: "come_online_request",

            title: "Come Online in Project Chat",

            message: `${targetUser.name}, ${project.title} team needs you online in the project chat.`,

            project: projectId

        });


    return notification;

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

    deleteNotification,
    sendComeOnlineRequest

};