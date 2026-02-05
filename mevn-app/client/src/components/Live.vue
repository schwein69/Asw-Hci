<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject } from "vue";
import { io } from "socket.io-client";
import {
  Clock,
  Bell,
  MapPin,
  Calendar,
  TrainFront,
  AlertTriangle,
  Info,
  Cloud,
  User,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sun,
  CloudRain,
  Wind,
  CloudSun,
  Snowflake, // Added for snow
  CloudLightning, // Added for storm
  RefreshCw, // Added for refresh button
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";
import { useRouter } from "vue-router";

const apiBase = inject("apiBase");

// Router
const router = useRouter();

// Socket.io connection
const socket = ref(null);

// Reactive state
const language = ref(getLanguage());
const hasUpcomingTrip = ref(false);
const trip = ref(null);
const activeFilter = ref("all"); // Filter state: all, weather, tourist, social, location

const notifications = ref([
  {
    id: 1,
    type: "social",
    city: "Berlin",
    time: "3:55:49 PM",
    message: "New interaction on your post",
    icon: "Bell",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 2,
    type: "weather",
    city: "Amsterdam",
    time: "3:53:58 PM",
    message: "Weather conditions updated",
    icon: "Cloud",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    type: "social",
    city: "Berlin",
    time: "3:52:58 PM",
    message: "New interaction on your post",
    icon: "Bell",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 4,
    type: "weather",
    city: "Amsterdam",
    time: "3:35:58 PM",
    message: "Weather conditions updated",
    icon: "Cloud",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 5,
    type: "weather",
    city: "Barcelona",
    time: "3:30:58 PM",
    message: "Weather conditions updated",
    icon: "Cloud",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 6,
    type: "location",
    city: "Copenhagen",
    time: "3:27:58 PM",
    message: "New eco-friendly location recommended",
    icon: "MapPin",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 7,
    type: "user",
    city: "Copenhagen",
    time: "12:33:29 PM",
    message: "Tourist density changed",
    icon: "User",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 8,
    type: "location",
    city: "Copenhagen",
    time: "12:32:59 PM",
    message: "New eco-friendly location recommended",
    icon: "MapPin",
    color: "bg-emerald-100 text-emerald-600",
  },
]);

// Complete list of available cities
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

const locations = ref([]);
const countdown = ref(60); // Countdown timer for next automatic check
let countdownInterval = null;

// Icon mapping for dynamic components
const iconComponents = {
  Bell,
  Cloud,
  MapPin,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Sun,
  CloudRain,
  Wind,
  CloudSun,
  Snowflake,
  CloudLightning,
};

// Computed properties
const t = computed(() => {
  return (key) => translate(key, language.value);
});

const filteredNotifications = computed(() => {
  // Filter by type if not "all"
  if (activeFilter.value === "all") {
    return notifications.value;
  }
  return notifications.value.filter((n) => n.type === activeFilter.value);
});

const notificationCounts = computed(() => {
  const counts = {
    all: notifications.value.length,
    unread: notifications.value.filter((n) => !n.isRead).length,
    weather: 0,
    tourist: 0,
    social: 0,
    location: 0,
  };
  notifications.value.forEach((n) => {
    if (counts[n.type] !== undefined) {
      counts[n.type]++;
    }
  });
  return counts;
});

// Methods
const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

const setFilter = (filter) => {
  activeFilter.value = filter;
};

const dismissReminder = () => {
  hasUpcomingTrip.value = false;
};

const viewTripDetails = () => {
  router.push("/world");
};

const markAllRead = async () => {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(
      `${apiBase}/notifications/mark-all-read/${userId}`,
      { method: "PUT" },
    );

    if (response.ok) {
      notifications.value = notifications.value.map((n) => ({
        ...n,
        isRead: true,
      }));
      alert("All notifications marked as read!");
    }
  } catch (error) {
    console.error("Failed to mark all as read:", error);
  }
};

// Toggle individual notification read status
const toggleNotificationRead = async (notificationId) => {
  const userId = getUserId();
  if (!userId) return;

  // Find the notification in local state
  const notification = notifications.value.find((n) => n.id === notificationId);
  if (!notification) return;

  const newReadStatus = !notification.isRead;

  try {
    const response = await fetch(
      `${apiBase}/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: newReadStatus }),
      },
    );

    if (response.ok) {
      // Update local state
      notifications.value = notifications.value.map((n) =>
        n.id === notificationId ? { ...n, isRead: newReadStatus } : n,
      );
      console.log(
        `✓ Notification ${newReadStatus ? "marked as read" : "marked as unread"}`,
      );
    }
  } catch (error) {
    console.error("Failed to toggle notification read status:", error);
  }
};

// Refresh notifications and locations
const refreshNotifications = async () => {
  console.log("Refreshing notifications and locations...");

  // Select new random locations
  selectRandomLocations();

  // Just fetch existing notifications from DB
  // removing pulling now Server automatically checks weather/crowd every 60s and pushes via Socket.io
  await fetchNotifications(true);

  console.log("Refresh complete");
};

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user._id || user.id;
};

// Start countdown timer
const startCountdown = () => {
  // Clear existing interval if any
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // Reset to 60 seconds
  countdown.value = 60;

  // Start countdown
  countdownInterval = setInterval(() => {
    countdown.value--;

    // When countdown reaches 0, notifications will arrive automatically via Socket.io
    if (countdown.value <= 0) {
      console.log(
        "[TIMER] Countdown reached 0, resetting to 60s. Waiting for server PUSH...",
      );
      countdown.value = 60; // Reset for next cycle
    }
  }, 1000);
};

// Fetch upcoming trip (within 24 hours)
const fetchUpcomingTrip = async () => {
  const userId = getUserId();
  console.log("🔍 Fetching trips for userId:", userId);
  if (!userId) return;

  try {
    const response = await fetch(`${apiBase}/trips/upcoming/${userId}`);
    const trips = await response.json();
    console.log("📦 Received trips:", trips);

    if (trips && trips.length > 0) {
      const upcomingTrip = trips[0];
      const segment = upcomingTrip.itinerary[0];

      // Calculate hours until departure
      const now = new Date();
      const departureTime = new Date(segment.startTime);
      const hoursUntil = Math.round((departureTime - now) / (1000 * 60 * 60));

      trip.value = {
        id: upcomingTrip._id,
        title: upcomingTrip.title,
        status: `Departure in ${hoursUntil} hours`,
        from: segment.fromLocation.name,
        to: segment.toLocation.name,
        type:
          segment.transportMode.charAt(0).toUpperCase() +
          segment.transportMode.slice(1),
        date: new Date(segment.startTime).toLocaleDateString(),
        time: new Date(segment.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      hasUpcomingTrip.value = true;
      console.log("✈️ Upcoming trip loaded:", trip.value);
    } else {
      hasUpcomingTrip.value = false;
      trip.value = null;
      console.log("📭 No upcoming trips found");
    }
  } catch (error) {
    console.error("Failed to fetch upcoming trip:", error);
    hasUpcomingTrip.value = false;
  }
};

// Fetch notifications from backend
const fetchNotifications = async (forceUnread = false) => {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(`${apiBase}/notifications/${userId}?limit=30`);
    const data = await response.json();

    if (data.success) {
      console.log("📥 Received notifications:", data.notifications.length);

      // Get current location names
      const currentCities = locations.value.map((loc) => loc.name);
      console.log("🏙️ Current cities:", currentCities);

      // Filter notifications to show only those for current locations
      const filtered = data.notifications.filter((n) =>
        currentCities.includes(n.city),
      );

      console.log(
        "Filtered notifications:",
        filtered.length,
        "for cities:",
        currentCities,
      );

      // Create a balanced mix of notification types
      const byType = {
        weather: [],
        tourist: [],
        social: [],
        location: [],
        transport: [],
      };

      // Group notifications by type
      filtered.forEach((n) => {
        const type = n.type;
        if (byType[type]) {
          byType[type].push(n);
        }
      });

      // Interleave notifications (alternate between types) for realistic mix
      const balanced = [];
      const maxPerType = 3;
      const types = Object.keys(byType).filter(
        (type) => byType[type].length > 0,
      );

      for (let i = 0; i < maxPerType; i++) {
        types.forEach((type) => {
          if (byType[type][i]) {
            balanced.push(byType[type][i]);
          }
        });
      }

      notifications.value = balanced.map((n) => ({
        id: n._id,
        type: n.type,
        city: n.city || "N/A",
        time: new Date(n.createdAt).toLocaleTimeString(),
        message: n.message,
        icon: n.icon || "Bell",
        color: getNotificationColor(n.type),
        isRead: forceUnread ? false : n.isRead, // Force unread if refresh
        timestamp: new Date(n.createdAt).getTime(),
      }));

      console.log("📋 Processed notifications:", notifications.value.length);
      console.log("🔍 First 3 notifications:", notifications.value.slice(0, 3));
    }
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  }
};

// DEPRECATED: No longer needed - server checks automatically every 60s
// Check weather and create notifications
// const checkWeatherAndNotify = async () => {
//   Server now handles this automatically via scheduler
//   Notifications arrive via Socket.io PUSH
// };

// DEPRECATED: No longer needed - server checks automatically every 60s
// Check crowd density and create notifications
// const checkCrowdAndNotify = async () => {
//   Server now handles this automatically via scheduler
//   Notifications arrive via Socket.io PUSH
// };

const getNotificationColor = (type) => {
  const colors = {
    weather: "bg-blue-100 text-blue-600",
    social: "bg-purple-100 text-purple-600",
    location: "bg-emerald-100 text-emerald-600",
    tourist: "bg-yellow-100 text-yellow-600",
    transport: "bg-orange-100 text-orange-600",
  };
  return colors[type] || "bg-gray-100 text-gray-600";
};

const getNotificationDotColor = (type) => {
  const colors = {
    weather: "bg-blue-500",
    tourist: "bg-red-500",
    transport: "bg-orange-500",
    social: "bg-purple-500",
    location: "bg-emerald-500",
  };
  return colors[type] || "bg-emerald-500";
};

// Select 4 random locations from the complete list
const selectRandomLocations = () => {
  const shuffled = [...ALL_LOCATIONS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);

  // Generate random crowd data for each location
  const crowdLevels = [
    {
      levelKey: "live.lowDensity",
      value: 30 + Math.floor(Math.random() * 20),
      color: "text-emerald-600",
      barColor: "bg-emerald-300",
      trend: "Down",
      trendIcon: "TrendingDown",
      alternative: null,
    },
    {
      levelKey: "live.mediumDensity",
      value: 50 + Math.floor(Math.random() * 20),
      color: "text-orange-500",
      barColor: "bg-orange-300",
      trend: "Up",
      trendIcon: "TrendingUp",
      alternative: "Consider indoor activities or postpone visit",
    },
    {
      levelKey: "live.highDensity",
      value: 70 + Math.floor(Math.random() * 20),
      color: "text-red-500",
      barColor: "bg-red-300",
      trend: "Stable",
      trendIcon: "Minus",
      alternative: "Visit during off-peak hours (early morning or evening)",
    },
  ];

  locations.value = selected.map((loc, index) => {
    const randomCrowd =
      crowdLevels[Math.floor(Math.random() * crowdLevels.length)];
    return {
      id: index + 1,
      name: loc.name,
      lat: loc.lat,
      lon: loc.lon,
      live: true,
      weather: {
        condition: "Loading...",
        temp: "--",
        icon: "Cloud",
        alert: false,
      },
      crowd: { ...randomCrowd },
      alternative: randomCrowd.alternative,
    };
  });

  console.log(
    "Selected random locations:",
    locations.value.map((l) => l.name).join(", "),
  );
};

// changing codes to icons ---
const getWeatherInfo = (code) => {
  if (code === 0) return { text: "Sunny", icon: "Sun", alert: false };
  if (code <= 3)
    return { text: "Partly Cloudy", icon: "CloudSun", alert: false };
  if (code <= 48) return { text: "Foggy", icon: "Cloud", alert: true };
  if (code <= 67) return { text: "Rainy", icon: "CloudRain", alert: true };
  if (code <= 77) return { text: "Snowy", icon: "Snowflake", alert: true };
  if (code <= 82) return { text: "Showers", icon: "CloudRain", alert: true };
  if (code <= 99)
    return { text: "Stormy", icon: "CloudLightning", alert: true };
  return { text: "Unknown", icon: "Cloud", alert: false };
};

// Setup Socket.io connection
const setupSocket = () => {
  const userId = getUserId();
  if (!userId) return;

  // Connect to Socket.io server
  socket.value = io(`http://localhost:${import.meta.env.VITE_API_PORT}`);

  socket.value.on("connect", () => {
    console.log("Connected to Socket.io server:", socket.value.id);
    // Join user's personal notification room
    socket.value.emit("join:notifications", userId);
  });

  // Listen for new notifications
  socket.value.on("notification:new", (notification) => {
    console.log("Received notification:", notification);
    addNotificationToList(notification);
  });

  // Listen for weather notifications
  socket.value.on("notification:weather", (notification) => {
    console.log("[PUSH RECEIVED] Weather notification:", notification);
    console.log("   → City:", notification.city);
    console.log("   → Message:", notification.message);
    addNotificationToList(notification);
  });

  // Listen for crowd notifications
  socket.value.on("notification:crowd", (notification) => {
    console.log("[PUSH RECEIVED] Crowd notification:", notification);
    console.log("   → City:", notification.city);
    console.log("   → Message:", notification.message);
    addNotificationToList(notification);
  });

  socket.value.on("disconnect", () => {
    console.log("Disconnected from Socket.io server");
  });

  socket.value.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
};

// Add notification to list (helper for socket events)
const addNotificationToList = (notification) => {
  const newNotification = {
    id: notification.id,
    type: notification.type,
    city: notification.city || "N/A",
    time: new Date(notification.createdAt).toLocaleTimeString(),
    message: notification.message,
    icon: notification.icon || "Bell",
    color: getNotificationColor(notification.type),
    isRead: notification.isRead,
    timestamp: new Date(notification.createdAt).getTime(),
  };

  // Add to beginning of array (most recent first)
  notifications.value.unshift(newNotification);

  // Keep only last 50 notifications
  if (notifications.value.length > 50) {
    notifications.value = notifications.value.slice(0, 50);
  }

  // Reset countdown timer when new notification arrives from server
  // This syncs the timer with server's automatic checks
  const oldCountdown = countdown.value;
  countdown.value = 60;
  console.log(
    `[PUSH SYNC] Timer reset: ${oldCountdown}s → 60s (notification received)`,
  );

  console.log("✅ Notification added to list:", newNotification.message);
};

// Lifecycle hooks
onMounted(() => {
  // First select random locations
  selectRandomLocations();

  // Then fetch data for those locations
  fetchUpcomingTrip();
  fetchNotifications(true); // Load notification history

  // NO MORE PULL! Weather/crowd checks happen automatically every 60s on server
  // Notifications arrive via Socket.io PUSH in real-time

  // Setup Socket.io for real-time push notifications
  setupSocket();

  // Start countdown timer for automatic updates
  startCountdown();

  window.addEventListener("languageChanged", handleLanguageChange);
});

onBeforeUnmount(() => {
  // Disconnect socket
  if (socket.value) {
    const userId = getUserId();
    if (userId) {
      socket.value.emit("leave:notifications", userId);
    }
    socket.value.disconnect();
  }

  // Clear countdown interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  window.removeEventListener("languageChanged", handleLanguageChange);
});
</script>

<template>
  <div class="space-y-8 pb-10 max-w-5xl mx-auto">
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6">
      <div class="flex items-center gap-2 mb-1 text-amber-900">
        <Clock class="w-5 h-5" />
        <h3 class="font-bold text-lg">
          {{ t("live.upcomingTravelReminders") }}
        </h3>
      </div>
      <p class="text-amber-800/70 text-sm mb-6">
        {{ t("live.dontMissDeparture") }}
      </p>

      <div
        v-if="hasUpcomingTrip"
        class="bg-white rounded-xl border border-amber-300 p-5 shadow-sm"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-start gap-3">
            <div class="bg-amber-100 p-2 rounded-lg text-amber-600">
              <Bell class="w-6 h-6" />
            </div>
            <div>
              <h4 class="font-bold text-gray-900 text-lg">{{ trip.title }}</h4>
              <p class="text-gray-500 text-sm">
                {{ t("live.departureIn") }} 24 {{ t("live.hours") }}
              </p>
            </div>
          </div>
          <span
            class="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
          >
            <Bell class="w-3 h-3 fill-current" /> {{ t("live.new") }}
          </span>
        </div>

        <div
          class="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 mb-4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p
                class="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-1"
              >
                <MapPin class="w-3.5 h-3.5" /> {{ t("live.route") }}
              </p>
              <div class="flex items-center gap-2 font-semibold text-gray-800">
                <span>{{ trip.from }}</span>
                <span class="text-gray-400">→</span>
                <span>{{ trip.to }}</span>
              </div>
            </div>

            <div>
              <p
                class="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-1"
              >
                <TrainFront class="w-3.5 h-3.5" /> {{ t("live.transport") }}
              </p>
              <span
                class="inline-block bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded"
              >
                {{ trip.type }}
              </span>
            </div>

            <div>
              <p
                class="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-1"
              >
                <Calendar class="w-3.5 h-3.5" /> {{ t("live.date") }}
              </p>
              <span class="font-semibold text-gray-800">{{ trip.date }}</span>
            </div>

            <div>
              <p
                class="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-1"
              >
                <Clock class="w-3.5 h-3.5" /> {{ t("live.time") }}
              </p>
              <span class="font-semibold text-gray-800">{{ trip.time }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="viewTripDetails"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            <Info class="w-4 h-4" /> {{ t("live.viewTripDetails") }}
          </button>
          <button
            @click="dismissReminder"
            class="px-6 border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold py-2.5 rounded-lg transition-colors"
          >
            {{ t("live.dismiss") }}
          </button>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-10 text-center"
      >
        <div
          class="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-gray-400 mb-3"
        >
          <Clock class="w-6 h-6" />
        </div>
        <p class="text-gray-600 font-medium">
          {{ t("live.noUpcomingReminders") }}
        </p>
        <p class="text-gray-400 text-sm">
          {{ t("live.notified24Hours") }}
        </p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
      <!-- Automatic Update Timer -->
      <div
        class="mb-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div
                class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <Clock class="w-6 h-6 text-emerald-600" />
              </div>
              <div
                class="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full animate-pulse flex items-center justify-center"
              >
                <span class="text-white text-[10px] font-bold">!</span>
              </div>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800">
                Automatic Push Updates
              </p>
              <p class="text-xs text-gray-600">
                Server checking all cities every 60 seconds
              </p>
            </div>
          </div>
          <div class="text-center">
            <div
              class="bg-white rounded-lg px-4 py-2 border-2 border-emerald-300 shadow-sm"
            >
              <p class="text-xs text-gray-500 mb-1">Next check in</p>
              <p class="text-2xl font-bold text-emerald-600">
                {{ countdown }}s
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-2">
            <Bell class="w-5 h-5 text-emerald-600" />
            <h3 class="font-bold text-lg text-gray-900">
              {{ t("live.notifications") }}
            </h3>
            <span
              v-if="notificationCounts.unread > 0"
              class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
              >{{ notificationCounts.unread }} {{ t("live.new") }}</span
            >
            <span
              v-else
              class="bg-gray-300 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full"
              >All Read ✓</span
            >
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {{ t("live.liveUpdates") }}
          </p>

          <!-- Filter Buttons -->
          <div class="flex flex-wrap gap-2 mt-3">
            <button
              @click="setFilter('all')"
              :class="
                activeFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              "
              class="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:shadow-sm"
            >
              All ({{ notificationCounts.all }})
            </button>
            <button
              @click="setFilter('weather')"
              :class="
                activeFilter === 'weather'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              "
              class="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:shadow-sm flex items-center gap-1"
            >
              <Cloud class="w-3 h-3" />
              Weather ({{ notificationCounts.weather }})
            </button>
            <button
              @click="setFilter('tourist')"
              :class="
                activeFilter === 'tourist'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              "
              class="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:shadow-sm flex items-center gap-1"
            >
              <User class="w-3 h-3" />
              Tourist ({{ notificationCounts.tourist }})
            </button>
            <button
              @click="setFilter('social')"
              :class="
                activeFilter === 'social'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              "
              class="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:shadow-sm flex items-center gap-1"
            >
              <Bell class="w-3 h-3" />
              Social ({{ notificationCounts.social }})
            </button>
            <button
              @click="setFilter('location')"
              :class="
                activeFilter === 'location'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              "
              class="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:shadow-sm flex items-center gap-1"
            >
              <MapPin class="w-3 h-3" />
              Location ({{ notificationCounts.location }})
            </button>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="refreshNotifications"
            class="text-xs font-medium text-emerald-600 border border-emerald-300 rounded px-3 py-1 hover:bg-emerald-50 transition-colors flex items-center gap-1"
            title="Refresh locations and notifications"
          >
            <RefreshCw class="w-3.5 h-3.5" />
          </button>
          <button
            @click="markAllRead"
            class="text-xs font-medium text-gray-600 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 transition-colors"
          >
            {{ t("live.markAllRead") }}
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in filteredNotifications"
          :key="item.id"
          @click="toggleNotificationRead(item.id)"
          class="flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer group"
          :class="
            item.isRead
              ? 'border-gray-200 bg-gray-50/50 opacity-60 hover:opacity-80'
              : 'border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50'
          "
          :title="
            item.isRead ? 'Click to mark as unread' : 'Click to mark as read'
          "
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="item.color"
            >
              <component :is="iconComponents[item.icon]" class="w-5 h-5" />
            </div>

            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span
                  class="text-[10px] px-1.5 py-0.5 border border-emerald-200 text-emerald-700 bg-white rounded font-medium"
                >
                  {{ item.city }}
                </span>
                <span class="text-xs text-gray-400">{{ item.time }}</span>
              </div>
              <p class="text-sm font-medium text-gray-800">
                {{ item.message }}
              </p>
            </div>
          </div>

          <div v-if="!item.isRead" class="flex items-center pr-2">
            <div
              class="w-2 h-2 rounded-full"
              :class="getNotificationDotColor(item.type)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="loc in locations"
        :key="loc.id"
        class="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2 text-emerald-800 font-bold">
            <MapPin class="w-4 h-4" />
            {{ loc.name }}
          </div>
          <div
            class="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500"
          >
            <div
              class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
            ></div>
            Live
          </div>
        </div>

        <div
          class="bg-sky-50 rounded-xl p-3 border border-sky-100 mb-3 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <component
              :is="iconComponents[loc.weather.icon]"
              class="w-5 h-5 text-sky-600"
            />
            <div>
              <p class="text-xs text-sky-800 font-bold">
                {{ t("live.weather") }}
              </p>
              <p class="text-sm text-gray-700">{{ loc.weather.condition }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="loc.weather.alert"
              class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded"
            >
              <AlertTriangle class="w-3 h-3 inline mr-0.5" />
              {{ t("live.alert") }}
            </span>
            <span class="text-xl font-bold text-sky-600">{{
              loc.weather.temp
            }}</span>
          </div>
        </div>

        <div class="bg-amber-50 rounded-xl p-3 border border-amber-100 mb-3">
          <div class="flex justify-between items-center mb-2">
            <div
              class="flex items-center gap-2 text-xs font-bold text-amber-800"
            >
              <User class="w-3.5 h-3.5" /> {{ t("live.touristAffluence") }}
            </div>
            <div
              class="flex items-center gap-1 text-[10px] font-medium text-gray-500"
            >
              <component
                :is="iconComponents[loc.crowd.trendIcon]"
                class="w-3 h-3"
                :class="
                  loc.crowd.trend === 'Up' ? 'text-red-500' : 'text-emerald-500'
                "
              />
              {{
                loc.crowd.trend === "Up"
                  ? t("live.up")
                  : loc.crowd.trend === "Down"
                    ? t("live.down")
                    : t("live.stable")
              }}
            </div>
          </div>

          <div
            class="w-full h-2 bg-gray-900 rounded-full overflow-hidden mb-1 flex"
          >
            <div
              class="h-full bg-black"
              :style="{ width: loc.crowd.value + '%' }"
            ></div>
            <div class="h-full flex-1" :class="loc.crowd.barColor"></div>
          </div>

          <div class="flex justify-between text-[10px] font-bold mt-1">
            <span :class="loc.crowd.color">{{
              t(loc.crowd.levelKey || "live.mediumDensity")
            }}</span>
            <span class="text-gray-400">{{ loc.crowd.value + 40 }}.9%</span>
          </div>
        </div>

        <div
          v-if="loc.alternative"
          class="bg-emerald-50 rounded-xl p-3 border border-emerald-100"
        >
          <div class="flex gap-2">
            <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-bold text-emerald-800">
                {{ t("live.alternativeSuggested") }}
              </p>
              <p class="text-[10px] text-emerald-700 leading-tight mt-0.5">
                {{ loc.alternative }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
