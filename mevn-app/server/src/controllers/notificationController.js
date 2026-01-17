import Notification from "../models/notification.js";
import {
  fetchWeatherData,
  fetchMultipleLocationsWeather,
  shouldCreateWeatherAlert,
} from "../services/weatherService.js";

/**
 * GET /api/notifications/:userId
 * Get all notifications for a user
 */
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, unreadOnly = false } = req.query;

    const query = { recipient: userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    console.log(
      `Sending ${notifications.length} notifications for user ${userId}`
    );
    console.log(
      "Sample:",
      notifications
        .slice(0, 3)
        .map((n) => ({ city: n.city, message: n.message }))
    );

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * POST /api/notifications
 * Create a new notification
 */
export const createNotification = async (req, res) => {
  try {
    const { recipient, type, message, city, icon, weatherData, referenceLink } =
      req.body;

    if (!recipient || !type || !message) {
      return res.status(400).json({
        success: false,
        message: "recipient, type, and message are required",
      });
    }

    const notification = new Notification({
      recipient,
      type,
      message,
      city,
      icon,
      weatherData,
      referenceLink,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/**
 * PUT /api/notifications/mark-all-read/:userId
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all as read",
      error: error.message,
    });
  }
};

/**
 * GET /api/notifications/weather/:userId
 * Fetch weather for user's locations and create alert notifications if needed
 */
export const checkWeatherAndNotify = async (req, res) => {
  try {
    const { userId } = req.params;
    const { locations } = req.body; // Array of {name, lat, lon}

    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({
        success: false,
        message: "locations array is required",
      });
    }

    // Fetch weather for all locations
    const weatherResults = await fetchMultipleLocationsWeather(locations);

    // Create notifications for weather alerts
    const newNotifications = [];
    for (const weather of weatherResults) {
      if (!weather.error && shouldCreateWeatherAlert(weather)) {
        const notification = new Notification({
          recipient: userId,
          type: "weather",
          city: weather.city,
          message: `Weather alert in ${weather.city}: ${weather.condition}`,
          icon: "Cloud",
          weatherData: {
            condition: weather.condition,
            temperature: weather.temperature,
            weatherCode: weather.weatherCode,
            alert: weather.alert,
          },
        });

        await notification.save();
        newNotifications.push(notification);
      }
    }

    res.status(200).json({
      success: true,
      weatherData: weatherResults,
      newNotifications,
      alertsCreated: newNotifications.length,
    });
  } catch (error) {
    console.error("Error checking weather:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check weather",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};
