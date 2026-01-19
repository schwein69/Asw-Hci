/**
 * Socket.io event handlers for notifications
 * Handles real-time push notifications to connected clients
 */

export const setupNotificationSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected for notifications:", socket.id);

    // Client joins their personal notification room
    socket.on("join:notifications", (userId) => {
      socket.join(`user:${userId}`);
      console.log(` User ${userId} joined notification room`);
    });

    // Client leaves notification room
    socket.on("leave:notifications", (userId) => {
      socket.leave(`user:${userId}`);
      console.log(` User ${userId} left notification room`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

/**
 * Emit notification to specific user
 * @param {Object} io - Socket.io instance
 * @param {String} userId - User ID to send notification to
 * @param {Object} notification - Notification data
 */
export const emitNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit("notification:new", {
    id: notification._id,
    type: notification.type,
    city: notification.city,
    message: notification.message,
    icon: notification.icon,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });
  console.log(`Pushed notification to user ${userId}:`, notification.type);
};

/**
 * Emit weather notification to specific user
 * @param {Object} io - Socket.io instance
 * @param {String} userId - User ID
 * @param {Object} notification - Weather notification data
 */
export const emitWeatherNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit("notification:weather", {
    id: notification._id,
    type: notification.type,
    city: notification.city,
    message: notification.message,
    icon: notification.icon,
    weatherData: notification.weatherData,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });
  console.log(
    `Pushed weather notification to user ${userId}:`,
    notification.city
  );
};

/**
 * Emit crowd notification to specific user
 * @param {Object} io - Socket.io instance
 * @param {String} userId - User ID
 * @param {Object} notification - Crowd notification data
 */
export const emitCrowdNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit("notification:crowd", {
    id: notification._id,
    type: notification.type,
    city: notification.city,
    message: notification.message,
    icon: notification.icon,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });
  console.log(
    `Pushed crowd notification to user ${userId}:`,
    notification.city
  );
};
