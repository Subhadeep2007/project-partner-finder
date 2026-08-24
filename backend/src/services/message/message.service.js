import Message from "../../models/message.js";
import Project from "../../models/project.js";

import cloudinary from "../../config/cloudinary.js";
const createMessage = async({
    projectId,
    senderId,
    encryptedContent,
    iv,
    encryptedKeys
}) => {
    // 1. Find project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Check if sender is owner
    const isOwner =
        project.owner.toString() === senderId;

    // 3. Check if sender is an accepted member
    const isMember = project.members.some(
        (memberId) =>
        memberId.toString() === senderId
    );

    // 4. Authorization
    if (!isOwner && !isMember) {
        throw new Error(
            "You are not authorized to send messages in this project"
        );
    }

    // 5. Validate encrypted message
    if (!encryptedContent || !iv) {
        throw new Error(
            "Encrypted message and IV are required"
        );
    }

    // 6. Validate encrypted keys
    if (!Array.isArray(encryptedKeys) ||
        encryptedKeys.length === 0
    ) {
        throw new Error(
            "Encrypted keys are required"
        );
    }

    // 7. Get all authorized participant IDs
    const authorizedUserIds = [
        project.owner.toString(),
        ...project.members.map(
            (memberId) => memberId.toString()
        )
    ];

    // 8. Get encrypted key user IDs
    const encryptedKeyUserIds =
        encryptedKeys.map(
            (key) => String(key.user)
        );

    // 9. Validate every encrypted key object
    const hasInvalidKey =
        encryptedKeys.some(
            (key) =>
            !key.user ||
            !key.encryptedKey ||
            key.keyVersion === undefined ||
            key.keyVersion === null
        );

    if (hasInvalidKey) {
        throw new Error(
            "Invalid encrypted key data"
        );
    }

    // 10. Check for duplicate users
    const uniqueEncryptedKeyUserIds =
        new Set(encryptedKeyUserIds);

    if (
        uniqueEncryptedKeyUserIds.size !==
        encryptedKeyUserIds.length
    ) {
        throw new Error(
            "Duplicate encrypted keys are not allowed"
        );
    }

    // 11. Every encrypted key must belong
    // to an authorized project participant
    const hasUnauthorizedUser =
        encryptedKeyUserIds.some(
            (userId) =>
            !authorizedUserIds.includes(userId)
        );

    if (hasUnauthorizedUser) {
        throw new Error(
            "Encrypted key contains unauthorized user"
        );
    }

    // 12. Every authorized participant
    // must have an encrypted key
    const hasMissingUser =
        authorizedUserIds.some(
            (userId) =>
            !encryptedKeyUserIds.includes(userId)
        );

    if (hasMissingUser) {
        throw new Error(
            "Missing encrypted key for a project participant"
        );
    }

    // 13. Save encrypted message
    const message = await Message.create({
        project: projectId,
        sender: senderId,
        messageType: "text",
        encryptedContent,
        iv,
        encryptedKeys
    });
    await message.populate(
        "sender",
        "name email profileImage"
    );
    return message;
};


const getProjectMessages = async({
    projectId,
    userId,
    page = 1,
    limit = 20
}) => {
    // 1. Find project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Check if user is project owner
    const isOwner =
        project.owner.toString() === userId;

    // 3. Check if user is project member
    const isMember = project.members.some(
        (memberId) =>
        memberId.toString() === userId
    );

    // 4. Authorization check
    if (!isOwner && !isMember) {
        throw new Error(
            "You are not authorized to view this project chat"
        );
    }

    // 5. Pagination
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

    // 6. Get messages
    const messages = await Message.find({
            project: projectId,
            deletedFor: {
                $ne: userId
            }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate(
            "sender",
            "name email profileImage"
        );

    // 7. Count total messages
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
                totalMessages / limitNumber
            )
        }
    };
};


const markDelivered = async({
    messageId,
    userId
}) => {
    // 1. Find message
    const message = await Message.findById(
        messageId
    );

    if (!message) {
        throw new Error("Message not found");
    }

    // 2. Sender cannot mark own message
    // as delivered
    if (message.sender.toString() === userId) {
        throw new Error(
            "Sender cannot mark their own message as delivered"
        );
    }

    // 3. Prevent duplicate delivery status
    const alreadyDelivered =
        message.deliveredTo.some(
            (deliveredUserId) =>
            deliveredUserId.toString() === userId
        );

    if (!alreadyDelivered) {
        message.deliveredTo.push(userId);
        await message.save();
    }

    return message;
};


const markRead = async({
    messageId,
    userId
}) => {
    // 1. Find message
    const message = await Message.findById(
        messageId
    );

    if (!message) {
        throw new Error("Message not found");
    }

    // 2. Sender cannot mark own message
    // as read
    if (message.sender.toString() === userId) {
        throw new Error(
            "Sender cannot mark their own message as read"
        );
    }

    // 3. Check whether already read
    const alreadyRead =
        message.readBy.some(
            (readUserId) =>
            readUserId.toString() === userId
        );

    // 4. Add user only once
    if (!alreadyRead) {
        message.readBy.push(userId);

        // Read means delivered too
        const alreadyDelivered =
            message.deliveredTo.some(
                (deliveredUserId) =>
                deliveredUserId.toString() === userId
            );

        if (!alreadyDelivered) {
            message.deliveredTo.push(userId);
        }

        await message.save();
    }

    return message;
};

const markProjectMessagesAsRead = async({
    projectId,
    userId
}) => {
    // 1. Find project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Check access
    const isOwner =
        project.owner.toString() === userId;

    const isMember = project.members.some(
        (memberId) =>
        memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
        throw new Error(
            "You are not authorized to access this project chat"
        );
    }

    // 3. Mark all unread messages as read
    const result = await Message.updateMany({
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
    }, {
        $addToSet: {
            readBy: userId,
            deliveredTo: userId
        }
    });

    return {
        projectId,
        modifiedCount: result.modifiedCount
    };
};
const deleteMessageForMe = async({
    messageId,
    userId
}) => {
    // 1. Find message
    const message = await Message.findById(
        messageId
    );

    if (!message) {
        throw new Error("Message not found");
    }

    // 2. Check project access
    const project = await Project.findById(
        message.project
    );

    if (!project) {
        throw new Error("Project not found");
    }

    const isOwner =
        project.owner.toString() === userId;

    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() === userId
        );

    if (!isOwner && !isMember) {
        throw new Error(
            "You are not authorized to delete this message"
        );
    }

    // 3. Prevent duplicate delete
    const alreadyDeleted =
        message.deletedFor.some(
            (deletedUserId) =>
            deletedUserId.toString() === userId
        );

    if (!alreadyDeleted) {
        message.deletedFor.push(userId);
        await message.save();
    }

    return message;
};

const getUnreadCount = async({
    projectId,
    userId
}) => {
    // 1. Check project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Check project access
    const isOwner =
        project.owner.toString() === userId;

    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() === userId
        );

    if (!isOwner && !isMember) {
        throw new Error(
            "You are not authorized to access this project chat"
        );
    }

    // 3. Count messages that:
    // - belong to this project
    // - were not sent by current user
    // - have not been read by current user
    // - are not deleted for current user
    // - are not deleted for everyone
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

    // 1. Find message
    const message = await Message.findById(
        messageId
    );

    if (!message) {
        throw new Error(
            "Message not found"
        );
    }


    // 2. Only sender can delete for everyone
    if (
        message.sender.toString() !== userId
    ) {
        throw new Error(
            "Only the sender can delete this message for everyone"
        );
    }


    // 3. If already deleted
    if (message.isDeletedForEveryone) {
        return message;
    }


    // 4. Delete uploaded file from Cloudinary
    if (message.filePublicId) {

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

            // Important:
            // Database message deletion should still continue.
        }

    }


    // 5. Soft delete message for everyone
    message.isDeletedForEveryone = true;

    message.deletedAt = new Date();


    // Optional: remove file URL so it
    // cannot be shown in the frontend anymore

    message.fileUrl = "";


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


    // requester must already have project access
    const isOwner =
        project.owner.toString() ===
        requesterId;


    const isMember =
        project.members.some(
            (memberId) =>
            memberId.toString() ===
            requesterId
        );


    if (!isOwner && !isMember) {
        throw new Error(
            "You are not authorized to update message keys"
        );
    }


    // target must be current project participant
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


    // Only original sender can edit
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


    // Text messages only
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