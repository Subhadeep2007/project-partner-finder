import "dotenv/config";

import http from "http";

import app from "./app.js";
import connectDatabase from "./config/database.js";
import { initializeSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 8000;

const startServer = async() => {
    try {
        // Connect to MongoDB
        await connectDatabase();

        // Create HTTP server
        const server = http.createServer(app);

        // Initialize Socket.IO
        initializeSocket(server);

        // Start server
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();