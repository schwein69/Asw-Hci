import express from "express";
import {
  getUserNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  checkWeatherAndNotify,
  checkCrowdAndNotify,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for a user
router.get("/:userId", getUserNotifications);

// Create a new notification
router.post("/", createNotification);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Mark all notifications as read for a user
router.put("/mark-all-read/:userId", markAllAsRead);

// Check weather and create notifications
router.post("/weather/:userId", checkWeatherAndNotify);

// Check crowd density and create notifications
router.post("/crowd/:userId", checkCrowdAndNotify);

// Delete a notification
router.delete("/:id", deleteNotification);

export default router;
