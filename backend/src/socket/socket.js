import {
    Server
} from "socket.io";

import jwt from "jsonwebtoken";

import Project from "../models/project.js";

import User from "../models/user.js";

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


const onlineUsers =
    new Map();


// ==========================================
// EMIT PRESENCE TO USER PROJECTS
// ==========================================

const emitPresenceToUserProjects =
    async(
        userId,
        eventName
    ) => {

        const projects =
            await Project.find({

                $or: [{
                        owner: userId
                    },

                    {
                        members: userId
                    }
                ]

            }).select("_id");


        projects.forEach(
            (project) => {

                io.to(
                    `project:${project._id.toString()}`
                ).emit(
                    eventName, {
                        userId,

                        projectId: project._id.toString()
                    }
                );

            }
        );

    };


// ==========================================
// INITIALIZE SOCKET
// ==========================================

const initializeSocket =
    (server) => {

        io =
            new Server(
                server, {
                    cors: {
                        origin: process.env.FRONTEND_URL,

                        credentials: true
                    }
                }
            );


        // ==========================================
        // SOCKET JWT AUTHENTICATION
        // ==========================================

        io.use(
            (socket, next) => {

                try {

                    const auth =
                        socket.handshake.auth;


                    const token =
                        auth &&
                        auth.token;


                    if (!token) {

                        return next(
                            new Error(
                                "Authentication token is required"
                            )
                        );

                    }


                    const decoded =
                        jwt.verify(
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

            }
        );


        // ==========================================
        // CONNECTION
        // ==========================================

        io.on(
            "connection",
            (socket) => {

                const userId =
                    socket.user.userId;


                // ==========================================
                // USER PERSONAL ROOM
                // ==========================================

                socket.join(
                    `user:${userId}`
                );


                // ==========================================
                // ONLINE USER TRACKING
                // ==========================================

                if (!onlineUsers.has(
                        userId
                    )) {

                    onlineUsers.set(
                        userId,
                        new Set()
                    );

                }


                onlineUsers
                    .get(userId)
                    .add(socket.id);


                // ==========================================
                // USER ONLINE
                // ==========================================

                emitPresenceToUserProjects(
                    userId,
                    "user_online"
                ).catch(
                    (error) => {

                        console.error(
                            "User online presence error:",
                            error.message
                        );

                    }
                );


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
                    async(
                        projectId,
                        callback
                    ) => {

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
                                .toString() ===
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
                                    "You are not authorized to join this project chat"
                                );

                            }


                            // ==========================================
                            // JOIN PROJECT ROOM
                            // ==========================================

                            socket.join(
                                `project:${projectId}`
                            );


                            // ==========================================
                            // GET ONLINE MEMBERS
                            // ==========================================

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


                            // ==========================================
                            // ADD OWNER IF ONLINE
                            // ==========================================

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


                            // ==========================================
                            // REQUEST MESSAGE REKEY
                            // ==========================================

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


                            // ==========================================
                            // CURRENT ONLINE MEMBERS
                            // ==========================================

                            socket.emit(
                                "project_online_members", {
                                    projectId,

                                    onlineMembers: onlineMemberIds
                                }
                            );


                            // ==========================================
                            // MEMBER ONLINE
                            // ==========================================

                            socket.to(
                                `project:${projectId}`
                            ).emit(
                                "project_member_online", {
                                    projectId,

                                    userId
                                }
                            );


                            if (
                                typeof callback ===
                                "function"
                            ) {

                                return callback({

                                    success: true,

                                    message: "Joined project chat successfully",

                                    projectId

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
                // MESSAGE REKEY COMPLETED
                // ==========================================

                socket.on(
                    "message_rekey_completed",
                    async({
                            projectId,
                            targetUserId
                        },
                        callback
                    ) => {

                        try {

                            if (!projectId ||
                                !targetUserId
                            ) {

                                throw new Error(
                                    "Project ID and target user ID are required"
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


                            // ==========================================
                            // REQUESTER ACCESS CHECK
                            // ==========================================

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
                                    "You are not authorized to update message keys"
                                );

                            }


                            // ==========================================
                            // TARGET USER CHECK
                            // ==========================================

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


                            // ==========================================
                            // BROADCAST COMPLETION
                            // ==========================================

                            io.to(
                                `project:${projectId}`
                            ).emit(
                                "message_rekey_completed", {
                                    projectId,

                                    targetUserId,

                                    completedBy: userId
                                }
                            );


                            if (
                                typeof callback ===
                                "function"
                            ) {

                                return callback({

                                    success: true,

                                    message: "Message re-key completion broadcast successfully"

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
                // TYPING START
                // ==========================================

                socket.on(
                    "typing_start",
                    async({
                            projectId
                        },
                        callback
                    ) => {

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


                            const typingKey =
                                `${socket.id}:${projectId}`;


                            if (
                                typingTimeouts.has(
                                    typingKey
                                )
                            ) {

                                clearTimeout(
                                    typingTimeouts.get(
                                        typingKey
                                    )
                                );

                            }


                            socket.to(
                                `project:${projectId}`
                            ).emit(
                                "user_typing", {
                                    projectId,

                                    userId,

                                    isTyping: true
                                }
                            );


                            const timeout =
                                setTimeout(
                                    () => {

                                        socket.to(
                                            `project:${projectId}`
                                        ).emit(
                                            "user_typing", {
                                                projectId,

                                                userId,

                                                isTyping: false
                                            }
                                        );


                                        typingTimeouts.delete(
                                            typingKey
                                        );

                                    },
                                    3000
                                );


                            typingTimeouts.set(
                                typingKey,
                                timeout
                            );


                            if (
                                typeof callback ===
                                "function"
                            ) {

                                return callback({

                                    success: true

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
                // TYPING STOP
                // ==========================================

                socket.on(
                    "typing_stop",
                    async({
                            projectId
                        },
                        callback
                    ) => {

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


                            const typingKey =
                                `${socket.id}:${projectId}`;


                            if (
                                typingTimeouts.has(
                                    typingKey
                                )
                            ) {

                                clearTimeout(
                                    typingTimeouts.get(
                                        typingKey
                                    )
                                );


                                typingTimeouts.delete(
                                    typingKey
                                );

                            }


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
                                typeof callback ===
                                "function"
                            ) {

                                return callback({

                                    success: true

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
                // SEND MESSAGE
                // ==========================================

                socket.on(
                    "send_message",
                    async(
                        data,
                        callback
                    ) => {

                        try {

                            const {
                                projectId,
                                encryptedContent,
                                iv,
                                encryptedKeys,
                                replyTo = null
                            } = data;


                            const senderId =
                                userId;


                            // ==========================================
                            // CREATE ENCRYPTED MESSAGE
                            // ==========================================

                            const message =
                                await createMessage({

                                    projectId,

                                    senderId,

                                    encryptedContent,

                                    iv,

                                    encryptedKeys,

                                    replyTo

                                });


                            // ==========================================
                            // GET PROJECT
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
                            // ALL PARTICIPANTS
                            // ==========================================

                            const allParticipantIds = [

                                project.owner.toString(),

                                ...project.members.map(
                                    (memberId) =>
                                    memberId.toString()
                                )

                            ];


                            const participantIds = [

                                ...new Set(
                                    allParticipantIds
                                )

                            ].filter(
                                (participantId) =>
                                participantId !==
                                senderId
                            );


                            // ==========================================
                            // UPDATE UNREAD COUNT
                            // ==========================================

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


                            // ==========================================
                            // SEND MESSAGE TO PROJECT ROOM
                            // ==========================================

                            io.to(
                                `project:${projectId}`
                            ).emit(
                                "receive_message",
                                message
                            );


                            if (
                                typeof callback ===
                                "function"
                            ) {

                                return callback({

                                    success: true,

                                    message: "Message sent successfully",

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
                // MESSAGE DELIVERED
                // ==========================================

                socket.on(
                    "message_delivered",
                    async({
                            messageId
                        },
                        callback
                    ) => {

                        try {

                            const message =
                                await markDelivered({
                                    messageId,

                                    userId
                                });


                            io.to(
                                `project:${message.project.toString()}`
                            ).emit(
                                "message_delivery_updated", {
                                    messageId: message._id,

                                    deliveredTo: message.deliveredTo
                                }
                            );


                            if (
                                typeof callback ===
                                "function"
                            ) {

                                return callback({

                                    success: true,

                                    message: "Message marked as delivered"

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
                // MESSAGE READ
                // ==========================================

                socket.on(
                    "message_read",
                    async({
                            messageId
                        },
                        callback
                    ) => {

                        try {

                            const message =
                                await markRead({
                                    messageId,

                                    userId
                                });


                            io.to(
                                `user:${userId}`
                            ).emit(
                                "unread_count_updated", {
                                    projectId: message.project.toString(),

                                    action: "refresh"
                                }
                            );


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
                                typeof callback ===
                                "function"
                            ) {

                                return callback({

                                    success: true,

                                    message: "Message marked as read"

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
                // MARK ENTIRE PROJECT CHAT AS READ
                // ==========================================

                socket.on(
                    "mark_project_messages_read",
                    async({
                            projectId
                        },
                        callback
                    ) => {

                        try {

                            const result =
                                await markProjectMessagesAsRead({
                                    projectId,

                                    userId
                                });


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
                                typeof callback ===
                                "function"
                            ) {

                                return callback({

                                    success: true,

                                    message: "Project messages marked as read",

                                    data: result

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
                // DELETE MESSAGE FOR ME
                // ==========================================

                socket.on(
                    "delete_message_for_me",
                    async({
                            messageId
                        },
                        callback
                    ) => {

                        try {

                            await deleteMessageForMe({

                                messageId,

                                userId

                            });


                            if (
                                typeof callback ===
                                "function"
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
                // DELETE MESSAGE FOR EVERYONE
                // ==========================================

                socket.on(
                    "delete_message_for_everyone",
                    async({ messageId }, callback) => {
                        try {

                            const deletedMessage =
                                await deleteMessageForEveryone({
                                    messageId,
                                    userId
                                });

                            io.to(
                                `project:${deletedMessage.projectId.toString()}`
                            ).emit(
                                "message_deleted_for_everyone", {
                                    messageId: deletedMessage.messageId.toString(),
                                    deletedAt: new Date()
                                }
                            );

                            if (typeof callback === "function") {
                                return callback({
                                    success: true,
                                    message: "Message deleted for everyone",
                                    data: deletedMessage
                                });
                            }

                        } catch (error) {

                            if (typeof callback === "function") {
                                return callback({
                                    success: false,
                                    message: error.message
                                });
                            }

                        }
                    }
                );


                // ==========================================
                // EDIT MESSAGE
                // ==========================================

                socket.on(
                    "edit_message",
                    async(
                        data,
                        callback
                    ) => {

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
                            onlineUsers.get(
                                userId
                            );


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

                                    socket.to(
                                        room
                                    ).emit(
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
                    async() => {

                        const userSockets =
                            onlineUsers.get(
                                userId
                            );


                        if (userSockets) {

                            userSockets.delete(
                                socket.id
                            );


                            // ==========================================
                            // USER COMPLETELY OFFLINE
                            // ==========================================

                            if (
                                userSockets.size ===
                                0
                            ) {

                                onlineUsers.delete(
                                    userId
                                );


                                // ==========================================
                                // SAVE LAST SEEN
                                // ==========================================

                                const lastSeen =
                                    new Date();


                                try {

                                    await User.findByIdAndUpdate(
                                        userId, {
                                            lastSeen
                                        }
                                    );

                                } catch (error) {

                                    console.error(
                                        "Failed to update last seen:",
                                        error.message
                                    );

                                }


                                // ==========================================
                                // NOTIFY PROJECT MEMBERS
                                // ==========================================

                                emitPresenceToUserProjects(
                                    userId,
                                    "user_offline"
                                ).catch(
                                    (error) => {

                                        console.error(
                                            "User offline presence error:",
                                            error.message
                                        );

                                    }
                                );

                            }

                        }


                        console.log(
                            "Socket disconnected:",
                            socket.id
                        );

                    }
                );

            }
        );


        return io;

    };


// ==========================================
// GET IO
// ==========================================

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