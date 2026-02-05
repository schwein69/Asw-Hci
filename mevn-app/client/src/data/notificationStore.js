import { ref } from "vue";

// Global notification state
export const unreadNotificationCount = ref(0);
export const latestNotifications = ref([]);
export const socket = ref(null);

// Add notification and increment unread count
export const addNotification = (notification) => {
  console.log("[NOTIFICATION STORE] Adding notification:", notification);
  console.log(
    "[NOTIFICATION STORE] Current unread count:",
    unreadNotificationCount.value,
  );

  latestNotifications.value.unshift(notification);
  // Keep only last 50 notifications in memory
  if (latestNotifications.value.length > 50) {
    latestNotifications.value = latestNotifications.value.slice(0, 50);
  }
  unreadNotificationCount.value++;

  console.log(
    "📊 [NOTIFICATION STORE] New unread count:",
    unreadNotificationCount.value,
  );
};

// Reset unread count (when user opens Live page)
export const resetUnreadCount = () => {
  unreadNotificationCount.value = 0;
};

// Set socket instance
export const setSocket = (socketInstance) => {
  socket.value = socketInstance;
};
