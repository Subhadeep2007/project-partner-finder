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

    // 1. Notification MongoDB me save hoga

    const notification =
        await Notification.create({

            recipient,
            sender,
            type,
            title,
            message,
            project

        });


    // 2. Sender ka public profile data

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


    // 3. Project details populate

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
                skills
                experienceLevel
                github
                linkedin
                portfolio
            `
        }
    });


    // 4. Real-time notification

    try {

        const io = getIO();

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



const getMyNotifications = async({
    userId,
    page = 1,
    limit = 20
}) => {

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


    const filter = {
        recipient: userId
    };


    const [
        notifications,
        totalNotifications,
        unreadCount
    ] = await Promise.all([


        Notification.find(filter)
        .sort({
            createdAt: -1
        })
        .skip(skip)
        .limit(limitNumber)


        // Sender full public profile

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


        // Project + Owner profile

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


        Notification.countDocuments(
            filter
        ),


        Notification.countDocuments({
            recipient: userId,
            isRead: false
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



export {
    createNotification,
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};