import Message from "../../models/message.js";
import Project from "../../models/project.js";

const createMessage = async({
    projectId,
    senderId,
    content
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

    // 5. Validate message
    if (!content || !content.trim()) {
        throw new Error(
            "Message content cannot be empty"
        );
    }

    // 6. Save message
    const message = await Message.create({
        project: projectId,
        sender: senderId,
        messageType: "text",
        content: content.trim()
    });

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
            project: projectId
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
            project: projectId
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
    const message = await Message.findById(messageId);

    if (!message) {
        throw new Error("Message not found");
    }

    // 2. Sender cannot mark own message as delivered
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
    const message = await Message.findById(messageId);

    if (!message) {
        throw new Error("Message not found");
    }

    // 2. Sender cannot mark own message as read
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
export {
    createMessage,
    getProjectMessages,
    markDelivered,
    markRead
};