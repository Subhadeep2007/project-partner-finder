import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import joinRequestRoutes from "./routes/joinRequest.routes.js";
import messageRoutes from "./routes/message.routes.js";

import messageUploadRoutes from "./routes/messageUpload.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
const app = express();

// Security middleware
app.use(helmet());

// Allow frontend requests
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);

// Read JSON request body
app.use(express.json());

// Read URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Read cookies
app.use(cookieParser());
app.use((req, res, next) => {
    if (
        req.method === "POST" &&
        req.originalUrl.includes("/messages/upload")
    ) {
        console.log(
            "🔥 UPLOAD REQUEST RECEIVED:",
            req.method,
            req.originalUrl,
            "PID:",
            process.pid
        );
    }

    next();
});
// Health check
app.get("/api/v1/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Project Partner Finder API is running"
    });
});

// Authentication routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use(
    "/api/v1/projects",
    projectRoutes
);
app.use("/api/v1", joinRequestRoutes);
app.use("/api/v1", messageRoutes);
app.use("/api/v1", messageUploadRoutes);
app.use(
    "/api/v1/notifications",
    notificationRoutes
);
app.use(errorMiddleware);
export default app;