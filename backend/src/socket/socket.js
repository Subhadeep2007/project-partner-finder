import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import Project from "../models/project.js";

import {
    createMessage,
    markDelivered,
    markRead,
    markProjectMessagesAsRead,
    deleteMessageForMe,
    deleteMessageForEveryone,
    editMessage
} from "../services/message/message.service.js";


let io;

const onlineUsers = new Map();


const emitPresenceToUserProjects = async(
    userId,
    eventName
) => {
    const projects = await Project.find({
        $or: [
            { owner: userId },
            { members: userId }
        ]
    }).select("_id");

    projects.forEach((project) => {
        io.to(
            `project:${project._id.toString()}`
        ).emit(
            eventName, {
                userId,
                projectId: project._id.toString()
            }
        );
    });
};


const initializeSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    });


    // ==========================================
    // SOCKET JWT AUTHENTICATION
    // ==========================================

    io.use((socket, next) => {
        try {

            const auth = socket.handshake.auth;

            const token = auth && auth.token;
            if (!token) {
                return next(
                    new Error(
                        "Authentication token is required"
                    )
                );
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = {
                userId: decoded.userId
            };

            next();

        } catch (error) {

            next(
                new Error(
                    "Invalid or expired authentication token"
                )
            );

        }
    });


    io.on("connection", (socket) => {

        const userId = socket.user.userId;


        // ==========================================
        // USER PERSONAL ROOM
        // ==========================================

        socket.join(`user:${userId}`);


        // ==========================================
        // ONLINE USER TRACKING
        // ==========================================

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(
                userId,
                new Set()
            );
        }

        onlineUsers
            .get(userId)
            .add(socket.id);


        // Notify user's project rooms
        // that the user is online
        emitPresenceToUserProjects(
            userId,
            "user_online"
        ).catch((error) => {
            console.error(
                "User online presence error:",
                error.message
            );
        });


        console.log(
            "Socket connected:",
            socket.id,
            "User:",
            userId
        );


        // ==========================================
        // JOIN PROJECT CHAT
        // ==========================================

        socket.on(
            "join_project_chat",
            async(projectId, callback) => {

                try {

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
                        project.owner
                        .toString() === userId;


                    const isMember =
                        project.members.some(
                            (memberId) =>
                            memberId
                            .toString() === userId
                        );


                    if (!isOwner && !isMember) {
                        throw new Error(
                            "You are not authorized to join this project chat"
                        );
                    }


                    // Join project room
                    socket.join(
                        `project:${projectId}`
                    );


                    // Get online members
                    const onlineMemberIds =
                        project.members
                        .filter(
                            (memberId) =>
                            onlineUsers.has(
                                memberId.toString()
                            )
                        )
                        .map(
                            (memberId) =>
                            memberId.toString()
                        );


                    // Add owner if online
                    if (
                        onlineUsers.has(
                            project.owner.toString()
                        )
                    ) {

                        if (!onlineMemberIds.includes(
                                project.owner.toString()
                            )) {
                            onlineMemberIds.push(
                                project.owner.toString()
                            );
                        }
                    }

                    socket.on(
                        "request_message_rekey",
                        ({
                            projectId,
                            targetUserId
                        }) => {

                            if (!projectId ||
                                !targetUserId
                            ) {
                                return;
                            }


                            socket
                                .to(
                                    `project:${projectId}`
                                )
                                .emit(
                                    "request_message_rekey", {
                                        projectId,
                                        targetUserId
                                    }
                                );

                        }
                    );
                    // Send current online members
                    socket.emit(
                        "project_online_members", {
                            projectId,
                            onlineMembers: onlineMemberIds
                        }
                    );


                    // Notify other members
                    socket.to(
                        `project:${projectId}`
                    ).emit(
                        "project_member_online", {
                            projectId,
                            userId
                        }
                    );


                    if (typeof callback === "function") {
                        return callback({
                            success: true,
                            message: "Joined project chat successfully",
                            projectId
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );


        // ==========================================
        // TYPING START
        // ==========================================

        socket.on(
            "typing_start",
            async({ projectId }, callback) => {
                try {
                    const project =
                        await Project.findById(projectId);

                    if (!project) {
                        throw new Error(
                            "Project not found"
                        );
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
                            "You are not authorized to access this project chat"
                        );
                    }

                    // Unique typing key for this socket + project
                    const typingKey =
                        `${socket.id}:${projectId}`;

                    // Clear previous timeout
                    if (typingTimeouts.has(typingKey)) {
                        clearTimeout(
                            typingTimeouts.get(typingKey)
                        );
                    }

                    // Notify others that user is typing
                    socket.to(
                        `project:${projectId}`
                    ).emit(
                        "user_typing", {
                            projectId,
                            userId,
                            isTyping: true
                        }
                    );

                    // Auto-stop typing after 3 seconds
                    const timeout = setTimeout(() => {
                        socket.to(
                            `project:${projectId}`
                        ).emit(
                            "user_typing", {
                                projectId,
                                userId,
                                isTyping: false
                            }
                        );

                        typingTimeouts.delete(typingKey);

                    }, 3000);

                    typingTimeouts.set(
                        typingKey,
                        timeout
                    );

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: true
                        });
                    }

                } catch (error) {
                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }
                }
            }
        );

        // ==========================================
        // TYPING STOP
        // ==========================================

        socket.on(
            "typing_stop",
            async({ projectId }, callback) => {

                try {

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
                        project.owner
                        .toString() === userId;


                    const isMember =
                        project.members.some(
                            (memberId) =>
                            memberId
                            .toString() === userId
                        );


                    if (!isOwner && !isMember) {
                        throw new Error(
                            "You are not authorized to access this project chat"
                        );
                    }
                    const typingKey =
                        `${socket.id}:${projectId}`;

                    if (typingTimeouts.has(typingKey)) {
                        clearTimeout(
                            typingTimeouts.get(typingKey)
                        );

                        typingTimeouts.delete(typingKey);
                    }

                    // Notify everyone except sender
                    socket.to(
                        `project:${projectId}`
                    ).emit(
                        "user_typing", {
                            projectId,
                            userId,
                            isTyping: false
                        }
                    );


                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: true
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );


        // ==========================================
        // SEND MESSAGE
        // ==========================================

        socket.on(
            "send_message",
            async(data, callback) => {

                try {

                    const {
                        projectId,
                        encryptedContent,
                        iv,
                        encryptedKeys
                    } = data;


                    const senderId = userId;


                    // Create encrypted message
                    const message =
                        await createMessage({
                            projectId,
                            senderId,
                            encryptedContent,
                            iv,
                            encryptedKeys
                        });


                    // Get project
                    const project =
                        await Project.findById(
                            projectId
                        );

                    if (!project) {
                        throw new Error(
                            "Project not found"
                        );
                    }


                    // Get all participants
                    const allParticipantIds = [
                        project.owner.toString(),
                        ...project.members.map(
                            (memberId) =>
                            memberId.toString()
                        )
                    ];


                    // Remove duplicates and sender
                    const participantIds = [
                        ...new Set(
                            allParticipantIds
                        )
                    ].filter(
                        (participantId) =>
                        participantId !== senderId
                    );


                    // Update unread count
                    participantIds.forEach(
                        (participantId) => {

                            io.to(
                                `user:${participantId}`
                            ).emit(
                                "unread_count_updated", {
                                    projectId,
                                    increment: 1
                                }
                            );

                        }
                    );


                    // Send message to project room
                    io.to(
                        `project:${projectId}`
                    ).emit(
                        "receive_message",
                        message
                    );


                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: true,
                            message: "Message sent successfully",
                            data: message
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );


        // ==========================================
        // MESSAGE DELIVERED
        // ==========================================

        socket.on(
            "message_delivered",
            async({ messageId }, callback) => {

                try {

                    const message =
                        await markDelivered({
                            messageId,
                            userId
                        });


                    // Notify project members
                    io.to(
                        `project:${message.project.toString()}`
                    ).emit(
                        "message_delivery_updated", {
                            messageId: message._id,
                            deliveredTo: message.deliveredTo
                        }
                    );


                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: true,
                            message: "Message marked as delivered"
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );


        // ==========================================
        // MESSAGE READ
        // ==========================================

        socket.on(
            "message_read",
            async({ messageId }, callback) => {

                try {

                    const message =
                        await markRead({
                            messageId,
                            userId
                        });


                    // Refresh unread count
                    io.to(
                        `user:${userId}`
                    ).emit(
                        "unread_count_updated", {
                            projectId: message.project.toString(),
                            action: "refresh"
                        }
                    );


                    // Notify project members
                    io.to(
                        `project:${message.project.toString()}`
                    ).emit(
                        "message_read_updated", {
                            messageId: message._id,
                            readBy: message.readBy,
                            deliveredTo: message.deliveredTo
                        }
                    );


                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: true,
                            message: "Message marked as read"
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );


        // ==========================================
        // MARK ENTIRE PROJECT CHAT AS READ
        // ==========================================

        socket.on(
            "mark_project_messages_read",
            async({ projectId }, callback) => {

                try {

                    const result =
                        await markProjectMessagesAsRead({
                            projectId,
                            userId
                        });


                    // Update unread badge
                    io.to(
                        `user:${userId}`
                    ).emit(
                        "unread_count_updated", {
                            projectId,
                            action: "refresh",
                            unreadCount: 0
                        }
                    );


                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: true,
                            message: "Project messages marked as read",
                            data: result
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );


        // ==========================================
        // DELETE MESSAGE FOR ME
        // ==========================================

        socket.on(
            "delete_message_for_me",
            async({ messageId }, callback) => {

                try {

                    await deleteMessageForMe({
                        messageId,
                        userId
                    });


                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: true,
                            message: "Message deleted for you",
                            data: {
                                messageId
                            }
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );


        // ==========================================
        // DELETE MESSAGE FOR EVERYONE
        // ==========================================

        socket.on(
            "delete_message_for_everyone",
            async({ messageId }, callback) => {

                try {

                    const message =
                        await deleteMessageForEveryone({
                            messageId,
                            userId
                        });


                    io.to(
                        `project:${message.project.toString()}`
                    ).emit(
                        "message_deleted_for_everyone", {
                            messageId: message._id,
                            deletedAt: message.deletedAt
                        }
                    );


                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: true,
                            message: "Message deleted for everyone"
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback === "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );
        socket.on(
            "edit_message",
            async(data, callback) => {

                try {

                    const {
                        messageId,
                        encryptedContent,
                        iv,
                        encryptedKeys
                    } = data || {};

                    if (!messageId) {
                        throw new Error(
                            "Message ID is required"
                        );
                    }

                    const message =
                        await editMessage({
                            messageId,
                            userId,
                            encryptedContent,
                            iv,
                            encryptedKeys
                        });

                    io.to(
                        `project:${message.project.toString()}`
                    ).emit(
                        "message_edited",
                        message
                    );

                    if (
                        typeof callback ===
                        "function"
                    ) {
                        return callback({
                            success: true,
                            message: "Message edited successfully",
                            data: message
                        });
                    }

                } catch (error) {

                    if (
                        typeof callback ===
                        "function"
                    ) {
                        return callback({
                            success: false,
                            message: error.message
                        });
                    }

                }

            }
        );

        // ==========================================
        // DISCONNECTING
        // ==========================================

        socket.on(
            "disconnecting",
            () => {

                const userSockets =
                    onlineUsers.get(userId);


                // Only offline if last socket
                if (
                    userSockets &&
                    userSockets.size === 1
                ) {

                    const joinedRooms = [
                        ...socket.rooms
                    ].filter(
                        (room) =>
                        room.startsWith(
                            "project:"
                        )
                    );


                    joinedRooms.forEach(
                        (room) => {

                            socket.to(room).emit(
                                "project_member_offline", {
                                    projectId: room.replace(
                                        "project:",
                                        ""
                                    ),
                                    userId
                                }
                            );

                        }
                    );

                }

            }
        );


        // ==========================================
        // DISCONNECT
        // ==========================================

        socket.on(
            "disconnect",
            () => {

                const userSockets =
                    onlineUsers.get(userId);


                if (userSockets) {

                    userSockets.delete(
                        socket.id
                    );


                    // No active device/tab left
                    if (
                        userSockets.size === 0
                    ) {

                        onlineUsers.delete(
                            userId
                        );


                        // Notify all projects
                        emitPresenceToUserProjects(
                            userId,
                            "user_offline"
                        ).catch((error) => {

                            console.error(
                                "User offline presence error:",
                                error.message
                            );

                        });

                    }

                }


                console.log(
                    "Socket disconnected:",
                    socket.id
                );

            }
        );

    });


    return io;
};


const getIO = () => {

    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized"
        );
    }

    return io;
};


export {
    initializeSocket,
    getIO
};