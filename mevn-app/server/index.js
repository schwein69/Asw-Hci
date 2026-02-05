import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import apiRoutes from "./src/routes/index.js";
import { setupNotificationSocket } from "./src/socket/notificationSocket.js";
import { initializeScheduler } from "./src/services/notificationScheduler.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost",
      "http://localhost:8080",
    ],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Make io accessible to routes
app.set("io", io);

app.use("/api", apiRoutes);

// Setup Socket.io notification handlers
setupNotificationSocket(io);

// Initialize automatic notification scheduler (PUSH every 60 seconds)
initializeScheduler(io);

mongoose
  .connect(MONGO_URI)
  .then(() =>
    httpServer.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    ),
  )
  .catch((err) => console.error("DB connection error:", err));

export { io };
