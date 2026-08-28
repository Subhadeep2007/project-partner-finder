import Message from "../../models/message.js";
import Project from "../../models/project.js";

import cloudinary from "../../config/cloudinary.js";


const createMessage = async({
    projectId,
    senderId,
    encryptedContent,
    iv,
    encryptedKeys,
    replyTo = null
}) => {

    // ==========================================
    // 1. FIND PROJECT
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
    // 2. CHECK OWNER
    // ==========================================

    const isOwner =
        project.owner.toString() ===
        senderId;


    // ==========================================
    // 3. CHECK MEMBER
    // ==========================================

    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() ===
            senderId
        );


    // ==========================================
    // 4. AUTHORIZATION
    // ==========================================

    if (!isOwner &&
        !isMember
    ) {

        throw new Error(
            "You are not authorized to send messages in this project"
        );

    }


    // ==========================================
    // 5. VALIDATE ENCRYPTED MESSAGE
    // ==========================================

    if (!encryptedContent ||
        !iv
    ) {

        throw new Error(
            "Encrypted message and IV are required"
        );

    }


    // ==========================================
    // 6. VALIDATE ENCRYPTED KEYS
    // ==========================================

    if (!Array.isArray(encryptedKeys) ||
        encryptedKeys.length === 0
    ) {

        throw new Error(
            "Encrypted keys are required"
        );

    }


    // ==========================================
    // 7. AUTHORIZED PARTICIPANTS
    // ==========================================

    const authorizedUserIds = [

        project.owner.toString(),

        ...project.members.map(
            (memberId) =>
            memberId.toString()
        )

    ];


    // ==========================================
    // 8. ENCRYPTED KEY USER IDS
    // ==========================================

    const encryptedKeyUserIds =
        encryptedKeys.map(
            (key) =>
            String(key.user)
        );


    // ==========================================
    // 9. VALIDATE KEY OBJECTS
    // ==========================================

    const hasInvalidKey =
        encryptedKeys.some(
            (key) =>
            !key.user ||
            !key.encryptedKey ||
            key.keyVersion ===
            undefined ||
            key.keyVersion ===
            null
        );


    if (hasInvalidKey) {

        throw new Error(
            "Invalid encrypted key data"
        );

    }


    // ==========================================
    // 10. DUPLICATE KEY USERS
    // ==========================================

    const uniqueEncryptedKeyUserIds =
        new Set(
            encryptedKeyUserIds
        );


    if (
        uniqueEncryptedKeyUserIds.size !==
        encryptedKeyUserIds.length
    ) {

        throw new Error(
            "Duplicate encrypted keys are not allowed"
        );

    }


    // ==========================================
    // 11. UNAUTHORIZED ENCRYPTED KEY
    // ==========================================

    const hasUnauthorizedUser =
        encryptedKeyUserIds.some(
            (userId) =>
            !authorizedUserIds.includes(
                userId
            )
        );


    if (hasUnauthorizedUser) {

        throw new Error(
            "Encrypted key contains unauthorized user"
        );

    }


    // ==========================================
    // 12. MISSING ENCRYPTED KEY
    // ==========================================

    const hasMissingUser =
        authorizedUserIds.some(
            (userId) =>
            !encryptedKeyUserIds.includes(
                userId
            )
        );


    if (hasMissingUser) {

        throw new Error(
            "Missing encrypted key for a project participant"
        );

    }


    // ==========================================
    // REPLY TO VALIDATION
    // ==========================================

    let replyToMessage = null;


    if (replyTo) {

        replyToMessage =
            await Message.findOne({

                _id: replyTo,

                project: projectId

            });


        if (!replyToMessage) {

            throw new Error(
                "Reply message not found in this project"
            );

        }


        if (
            replyToMessage.isDeletedForEveryone
        ) {

            throw new Error(
                "Cannot reply to a deleted message"
            );

        }

    }


    // ==========================================
    // SAVE MESSAGE
    // ==========================================

    const message =
        await Message.create({

            project: projectId,

            sender: senderId,

            messageType: "text",

            encryptedContent,

            iv,

            encryptedKeys,

            replyTo: replyToMessage ?
                replyToMessage._id :
                null

        });


    // ==========================================
    // POPULATE SENDER
    // ==========================================

    await message.populate(
        "sender",
        "name email profileImage"
    );


    // ==========================================
    // POPULATE REPLY
    // ==========================================

    if (message.replyTo) {

        await message.populate({

            path: "replyTo",

            select: `
                sender
                messageType
                content
                encryptedContent
                iv
                encryptedKeys
                isDeletedForEveryone
                createdAt
            `,

            populate: {

                path: "sender",

                select: "name email profileImage"

            }

        });

    }


    return message;

};



const getProjectMessages = async({
    projectId,
    userId,
    page = 1,
    limit = 20
}) => {

    // ==========================================
    // 1. FIND PROJECT
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
    // 2. CHECK OWNER
    // ==========================================

    const isOwner =
        project.owner.toString() ===
        userId;


    // ==========================================
    // 3. CHECK MEMBER
    // ==========================================

    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() ===
            userId
        );


    // ==========================================
    // 4. AUTHORIZATION
    // ==========================================

    if (!isOwner &&
        !isMember
    ) {

        throw new Error(
            "You are not authorized to view this project chat"
        );

    }


    // ==========================================
    // 5. PAGINATION
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
    // 6. GET MESSAGES
    // ==========================================

    const messages =
        await Message.find({

            project: projectId,

            deletedFor: {
                $ne: userId
            }

        })

    .sort({
        createdAt: -1
    })

    .skip(skip)

    .limit(limitNumber)

    .populate(
        "sender",
        "name email profileImage"
    )

    // ======================================
    // REPLY POPULATION
    // ======================================

    .populate({

        path: "replyTo",

        select: `
                sender
                messageType
                content
                encryptedContent
                iv
                encryptedKeys
                isDeletedForEveryone
                createdAt
            `,

        populate: {

            path: "sender",

            select: "name email profileImage"

        }

    });


    // ==========================================
    // 7. COUNT MESSAGES
    // ==========================================

    const totalMessages =
        await Message.countDocuments({

            project: projectId,

            deletedFor: {
                $ne: userId
            }

        });


    return {

        messages,

        pagination: {

            page: pageNumber,

            limit: limitNumber,

            totalMessages,

            totalPages: Math.ceil(
                totalMessages /
                limitNumber
            )

        }

    };

};



const markDelivered = async({
    messageId,
    userId
}) => {

    const message =
        await Message.findById(
            messageId
        );


    if (!message) {

        throw new Error(
            "Message not found"
        );

    }


    if (
        message.sender.toString() ===
        userId
    ) {

        throw new Error(
            "Sender cannot mark their own message as delivered"
        );

    }


    const alreadyDelivered =
        message.deliveredTo.some(
            (deliveredUserId) =>
            deliveredUserId.toString() ===
            userId
        );


    if (!alreadyDelivered) {

        message.deliveredTo.push(
            userId
        );

        await message.save();

    }


    return message;

};



const markRead = async({
    messageId,
    userId
}) => {

    const message =
        await Message.findById(
            messageId
        );


    if (!message) {

        throw new Error(
            "Message not found"
        );

    }


    if (
        message.sender.toString() ===
        userId
    ) {

        throw new Error(
            "Sender cannot mark their own message as read"
        );

    }


    const alreadyRead =
        message.readBy.some(
            (readUserId) =>
            readUserId.toString() ===
            userId
        );


    if (!alreadyRead) {

        message.readBy.push(
            userId
        );


        const alreadyDelivered =
            message.deliveredTo.some(
                (deliveredUserId) =>
                deliveredUserId.toString() ===
                userId
            );


        if (!alreadyDelivered) {

            message.deliveredTo.push(
                userId
            );

        }


        await message.save();

    }


    return message;

};



const markProjectMessagesAsRead = async({
    projectId,
    userId
}) => {

    const project =
        await Project.findById(
            projectId
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    const isOwner =
        project.owner.toString() ===
        userId;


    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() ===
            userId
        );


    if (!isOwner &&
        !isMember
    ) {

        throw new Error(
            "You are not authorized to access this project chat"
        );

    }


    const result =
        await Message.updateMany(

            {

                project: projectId,

                sender: {
                    $ne: userId
                },

                readBy: {
                    $ne: userId
                },

                deletedFor: {
                    $ne: userId
                },

                isDeletedForEveryone: false

            },

            {

                $addToSet: {

                    readBy: userId,

                    deliveredTo: userId

                }

            }

        );


    return {

        projectId,

        modifiedCount: result.modifiedCount

    };

};



const deleteMessageForMe = async({
    messageId,
    userId
}) => {

    const message =
        await Message.findById(
            messageId
        );


    if (!message) {

        throw new Error(
            "Message not found"
        );

    }


    const project =
        await Project.findById(
            message.project
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    const isOwner =
        project.owner.toString() ===
        userId;


    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() ===
            userId
        );


    if (!isOwner &&
        !isMember
    ) {

        throw new Error(
            "You are not authorized to delete this message"
        );

    }


    const alreadyDeleted =
        message.deletedFor.some(
            (deletedUserId) =>
            deletedUserId.toString() ===
            userId
        );


    if (!alreadyDeleted) {

        message.deletedFor.push(
            userId
        );

        await message.save();

    }


    return message;

};



const getUnreadCount = async({
    projectId,
    userId
}) => {

    const project =
        await Project.findById(
            projectId
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    const isOwner =
        project.owner.toString() ===
        userId;


    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() ===
            userId
        );


    if (!isOwner &&
        !isMember
    ) {

        throw new Error(
            "You are not authorized to access this project chat"
        );

    }


    const unreadCount =
        await Message.countDocuments({

            project: projectId,

            sender: {
                $ne: userId
            },

            readBy: {
                $ne: userId
            },

            deletedFor: {
                $ne: userId
            },

            isDeletedForEveryone: false

        });


    return {

        projectId,

        unreadCount

    };

};



const deleteMessageForEveryone = async({
    messageId,
    userId
}) => {

    const message =
        await Message.findById(
            messageId
        );


    if (!message) {

        throw new Error(
            "Message not found"
        );

    }


    if (
        message.sender.toString() !==
        userId
    ) {

        throw new Error(
            "Only the sender can delete this message for everyone"
        );

    }


    if (
        message.isDeletedForEveryone
    ) {

        return message;

    }


    if (
        message.filePublicId
    ) {

        try {

            await cloudinary.uploader.destroy(
                message.filePublicId, {
                    resource_type: message.fileResourceType ||
                        "image"
                }
            );

        } catch (error) {

            console.error(
                "Cloudinary file deletion failed:",
                error.message
            );

        }

    }


    message.isDeletedForEveryone =
        true;


    message.deletedAt =
        new Date();


    message.fileUrl =
        "";


    await message.save();


    return {

        messageId: message._id,

        projectId: message.project,

        isDeletedForEveryone: message.isDeletedForEveryone

    };

};



const addEncryptedKeyForUser = async({
    messageId,
    projectId,
    requesterId,
    targetUserId,
    encryptedKey,
    keyVersion
}) => {

    if (!messageId ||
        !projectId ||
        !requesterId ||
        !targetUserId ||
        !encryptedKey
    ) {

        throw new Error(
            "Message re-key data is incomplete"
        );

    }


    const project =
        await Project.findById(
            projectId
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    const isOwner =
        project.owner.toString() ===
        requesterId;


    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() ===
            requesterId
        );


    if (!isOwner &&
        !isMember
    ) {

        throw new Error(
            "You are not authorized to update message keys"
        );

    }


    const targetIsOwner =
        project.owner.toString() ===
        targetUserId;


    const targetIsMember =
        project.members.some(
            (memberId) =>
            memberId.toString() ===
            targetUserId
        );


    if (!targetIsOwner &&
        !targetIsMember
    ) {

        throw new Error(
            "Target user is not a project participant"
        );

    }


    const message =
        await Message.findOne({

            _id: messageId,

            project: projectId

        });


    if (!message) {

        throw new Error(
            "Message not found"
        );

    }


    const alreadyExists =
        message.encryptedKeys.some(
            (item) =>
            item.user.toString() ===
            targetUserId
        );


    if (!alreadyExists) {

        message.encryptedKeys.push({

            user: targetUserId,

            encryptedKey,

            keyVersion: keyVersion || 1

        });


        await message.save();

    }


    return message;

};



const editMessage = async({
    messageId,
    userId,
    encryptedContent,
    iv,
    encryptedKeys
}) => {

    if (!messageId ||
        !userId ||
        !encryptedContent ||
        !iv ||
        !Array.isArray(encryptedKeys) ||
        encryptedKeys.length === 0
    ) {

        throw new Error(
            "Encrypted edited message data is incomplete"
        );

    }


    const message =
        await Message.findById(
            messageId
        );


    if (!message) {

        throw new Error(
            "Message not found"
        );

    }


    if (
        message.sender.toString() !==
        userId
    ) {

        throw new Error(
            "Only the sender can edit this message"
        );

    }


    if (
        message.isDeletedForEveryone
    ) {

        throw new Error(
            "Deleted message cannot be edited"
        );

    }


    if (
        message.messageType !==
        "text"
    ) {

        throw new Error(
            "Only text messages can be edited"
        );

    }


    message.encryptedContent =
        encryptedContent;


    message.iv =
        iv;


    message.encryptedKeys =
        encryptedKeys;


    message.isEdited =
        true;


    message.editedAt =
        new Date();


    await message.save();


    await message.populate(
        "sender",
        "name email profileImage"
    );


    // IMPORTANT:
    // Keep replyTo populated when edited message
    // is broadcast to chat.

    if (message.replyTo) {

        await message.populate({

            path: "replyTo",

            select: `
                sender
                messageType
                content
                encryptedContent
                iv
                encryptedKeys
                isDeletedForEveryone
                createdAt
            `,

            populate: {

                path: "sender",

                select: "name email profileImage"

            }

        });

    }


    return message;

};



export {
    createMessage,
    getProjectMessages,
    markDelivered,
    markRead,
    markProjectMessagesAsRead,
    deleteMessageForMe,
    deleteMessageForEveryone,
    getUnreadCount,
    addEncryptedKeyForUser,
    editMessage
};