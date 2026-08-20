import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Project from "../models/project.js";
import {
    createMessage
} from "../services/message/message.service.js";
let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    });

    // 🔐 Socket JWT Authentication Middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(
                    new Error("Authentication token is required")
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
                new Error("Invalid or expired authentication token")
            );
        }
    });

    io.on("connection", (socket) => {
        console.log(
            "Socket connected:",
            socket.id,
            "User:",
            socket.user.userId
        );

        socket.on(
            "join_project_chat",
            async(projectId, callback) => {
                try {
                    // 1. Find project
                    const project = await Project.findById(projectId);

                    if (!project) {
                        return callback({
                            success: false,
                            message: "Project not found"
                        });
                    }

                    const userId = socket.user.userId;

                    // 2. Check owner
                    const isOwner =
                        project.owner.toString() === userId;

                    // 3. Check member
                    const isMember = project.members.some(
                        (memberId) =>
                        memberId.toString() === userId
                    );

                    // 4. Authorization
                    if (!isOwner && !isMember) {
                        return callback({
                            success: false,
                            message: "You are not authorized to join this project chat"
                        });
                    }

                    // 5. Join Socket.IO room
                    socket.join(`project:${projectId}`);

                    console.log(
                        `User ${userId} joined project chat ${projectId}`
                    );

                    return callback({
                        success: true,
                        message: "Joined project chat successfully",
                        projectId
                    });

                } catch (error) {
                    console.error(
                        "Join project chat error:",
                        error.message
                    );

                    return callback({
                        success: false,
                        message: "Failed to join project chat"
                    });
                }
            }
        );
        socket.on(
            "send_message",
            async(data, callback) => {
                try {
                    const {
                        projectId,
                        content
                    } = data;

                    // 1. Get authenticated sender
                    const senderId = socket.user.userId;

                    // 2. Create and save message
                    const message = await createMessage({
                        projectId,
                        senderId,
                        content
                    });

                    // 3. Send message to everyone in project room
                    io.to(`project:${projectId}`).emit(
                        "receive_message",
                        message
                    );

                    // 4. Confirm sender
                    return callback({
                        success: true,
                        message: "Message sent successfully",
                        data: message
                    });

                } catch (error) {
                    return callback({
                        success: false,
                        message: error.message
                    });
                }
            }
        );
        socket.on("disconnect", () => {
            console.log(
                "Socket disconnected:",
                socket.id
            );
        });
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