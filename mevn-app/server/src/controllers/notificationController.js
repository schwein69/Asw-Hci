import Notification from "../models/notification.js";
import {
  fetchWeatherData,
  fetchMultipleLocationsWeather,
  shouldCreateWeatherAlert,
} from "../services/weatherService.js";
import {
  calculateMultipleLocationsCrowd,
  shouldCreateCrowdAlert,
  generateCrowdAlertMessage,
} from "../services/crowdService.js";
import {
  emitNotification,
  emitWeatherNotification,
  emitCrowdNotification,
} from "../socket/notificationSocket.js";

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

    // Push notification via Socket.io
    const io = req.app.get("io");
    if (io) {
      emitNotification(io, recipient, notification);
    }

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

    // Create notifications for weather alerts (only if not already exists in last hour)
    const newNotifications = [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const weather of weatherResults) {
      if (!weather.error && shouldCreateWeatherAlert(weather)) {
        // Check if similar notification already exists in last hour
        const existingNotification = await Notification.findOne({
          recipient: userId,
          type: "weather",
          city: weather.city,
          "weatherData.weatherCode": weather.weatherCode,
          createdAt: { $gte: oneHourAgo },
        });

        // Only create if doesn't exist
        if (!existingNotification) {
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

          // Push weather notification via Socket.io
          const io = req.app.get("io");
          if (io) {
            emitWeatherNotification(io, userId, notification);
          }
        }
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

/**
 * POST /api/notifications/crowd/:userId
 * Calculate crowd density for user's locations and create alert notifications if needed
 */
export const checkCrowdAndNotify = async (req, res) => {
  try {
    const { userId } = req.params;
    const { locations, weatherDataMap } = req.body; // locations array, weatherDataMap object

    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({
        success: false,
        message: "locations array is required",
      });
    }

    // Calculate crowd density for all locations
    const crowdResults = calculateMultipleLocationsCrowd(
      locations,
      weatherDataMap || {}
    );

    // Create notifications for high crowd alerts (only if not already exists in last hour)
    const newNotifications = [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const crowd of crowdResults) {
      if (shouldCreateCrowdAlert(crowd.density)) {
        // Check if similar notification already exists in last hour
        const existingNotification = await Notification.findOne({
          recipient: userId,
          type: "tourist",
          city: crowd.location,
          createdAt: { $gte: oneHourAgo },
        });

        // Only create if doesn't exist
        if (!existingNotification) {
          const notification = new Notification({
            recipient: userId,
            type: "tourist",
            city: crowd.location,
            message: generateCrowdAlertMessage(crowd.location, crowd.density),
            icon: "Users",
            crowdData: {
              density: crowd.density,
              level: crowd.level,
              trend: crowd.trend,
              alternative: crowd.alternative,
            },
          });

          await notification.save();
          newNotifications.push(notification);

          // Push crowd notification via Socket.io
          const io = req.app.get("io");
          if (io) {
            emitCrowdNotification(io, userId, notification);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      crowdData: crowdResults,
      newNotifications,
      alertsCreated: newNotifications.length,
    });
  } catch (error) {
    console.error("Error checking crowd density:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check crowd density",
      error: error.message,
    });
  }
};
