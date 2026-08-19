import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
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
app.use(errorMiddleware);
export default app;