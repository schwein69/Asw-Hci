import cron from "node-cron";
import User from "../models/users.js";
import Notification from "../models/notification.js";
import {
  fetchMultipleLocationsWeather,
  shouldCreateWeatherAlert,
} from "../services/weatherService.js";
import {
  calculateMultipleLocationsCrowd,
  shouldCreateCrowdAlert,
  generateCrowdAlertMessage,
} from "../services/crowdService.js";
import {
  emitWeatherNotification,
  emitCrowdNotification,
} from "../socket/notificationSocket.js";

// All European cities to monitor
const ALL_LOCATIONS = [
  { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
  { name: "Barcelona", lat: 41.3851, lon: 2.1734 },
  { name: "Copenhagen", lat: 55.6761, lon: 12.5683 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Rome", lat: 41.9028, lon: 12.4964 },
  { name: "Vienna", lat: 48.2082, lon: 16.3738 },
  { name: "Prague", lat: 50.0755, lon: 14.4378 },
  { name: "Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Lisbon", lat: 38.7223, lon: -9.1393 },
  { name: "Brussels", lat: 50.8503, lon: 4.3517 },
  { name: "Budapest", lat: 47.4979, lon: 19.0402 },
];

let io = null; // Socket.io instance
let lastCheckTime = new Date();

/**
 * Initialize the notification scheduler with Socket.io instance
 */
export const initializeScheduler = (socketIo) => {
  io = socketIo;
  console.log("Notification scheduler initialized");

  // Start the cron job - runs every 60 seconds
  startScheduler();
};

/**
 * Start the automatic notification scheduler
 * Runs every 60 seconds to check weather and crowd for all cities
 */
const startScheduler = () => {
  // Every 60 seconds
  cron.schedule("*/60 * * * * *", async () => {
    console.log("[PUSH] Running automatic notification check...");
    lastCheckTime = new Date();

    try {
      await checkAndNotifyAllUsers();
      console.log("[PUSH] Automatic check completed");
    } catch (error) {
      console.error("[PUSH] Error in automatic check:", error);
    }
  });

  console.log("Scheduler started: checking every 60 seconds");
};

/**
 * Check weather and crowd for all cities and notify all active users
 */
const checkAndNotifyAllUsers = async () => {
  // Get all active users
  const users = await User.find({ isActive: { $ne: false } }).select("_id");

  if (users.length === 0) {
    console.log("No active users to notify");
    return;
  }

  console.log(`Checking notifications for ${users.length} users`);

  // Check weather for all cities
  const weatherResults = await fetchMultipleLocationsWeather(ALL_LOCATIONS);

  // Check crowd for all cities
  const crowdResults = calculateMultipleLocationsCrowd(ALL_LOCATIONS, {});

  // Create notifications for each user
  for (const user of users) {
    await createWeatherNotifications(user._id, weatherResults);
    await createCrowdNotifications(user._id, crowdResults);
  }
};

/**
 * Create weather notifications for a user
 */
const createWeatherNotifications = async (userId, weatherResults) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const weather of weatherResults) {
    if (!weather.error && shouldCreateWeatherAlert(weather)) {
      // Check if similar notification exists in last hour
      const existingNotification = await Notification.findOne({
        recipient: userId,
        type: "weather",
        city: weather.city,
        "weatherData.weatherCode": weather.weatherCode,
        createdAt: { $gte: oneHourAgo },
      });

      if (!existingNotification) {
        const notification = new Notification({
          recipient: userId,
          type: "weather",
          city: weather.city,
          message: `Weather alert in ${weather.city}: ${weather.condition}`,
          icon: weather.icon || "Cloud",
          weatherData: {
            condition: weather.condition,
            temperature: weather.temperature,
            weatherCode: weather.weatherCode,
            alert: weather.alert,
          },
        });

        await notification.save();

        // Push via Socket.io
        if (io) {
          emitWeatherNotification(io, userId.toString(), notification);
        }

        console.log(
          `[PUSH] Weather alert created for ${weather.city} → user ${userId}`,
        );
      }
    }
  }
};

/**
 * Create crowd notifications for a user
 */
const createCrowdNotifications = async (userId, crowdResults) => {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  for (const crowd of crowdResults) {
    if (shouldCreateCrowdAlert(crowd.density)) {
      // Check if similar notification exists in last 6 hours
      const existingNotification = await Notification.findOne({
        recipient: userId,
        type: "tourist",
        city: crowd.location,
        createdAt: { $gte: sixHoursAgo },
      });

      if (!existingNotification) {
        const notification = new Notification({
          recipient: userId,
          type: "tourist",
          city: crowd.location,
          message: generateCrowdAlertMessage(crowd.location, crowd.density),
          icon: "User",
          crowdData: {
            density: crowd.density,
            level: crowd.level,
            trend: crowd.trend,
            alternative: crowd.alternative,
          },
        });

        await notification.save();

        // Push via Socket.io
        if (io) {
          emitCrowdNotification(io, userId.toString(), notification);
        }

        console.log(
          `[PUSH] Crowd alert created for ${crowd.location} → user ${userId}`,
        );
      }
    }
  }
};

/**
 * Get the last check time (for displaying in UI)
 */
export const getLastCheckTime = () => lastCheckTime;
