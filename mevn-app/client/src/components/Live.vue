<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
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
  Snowflake,
  CloudLightning,
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";
import { useRouter } from "vue-router";

<<<<<<< HEAD
export default {
  name: "Live",
  setup() {
    const router = useRouter();
    return { router };
  },
  components: {
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
    Snowflake,
    CloudLightning,
  },
  data() {
    return {
      language: getLanguage(),
      hasUpcomingTrip: false,
      trip: null,
      notifications: [
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
      ],

      locations: [
        {
          id: 1,
          name: "Amsterdam",
          lat: 52.3676,
          lon: 4.9041,
          live: true,
          weather: {
            condition: "Loading...",
            temp: "--",
            icon: "Cloud",
            alert: false,
          },
          crowd: {
            levelKey: "live.lowDensity",
            value: 45,
            trend: "Up",
            trendIcon: "TrendingUp",
            color: "text-emerald-600",
            barColor: "bg-emerald-300",
          },
          alternative: null,
        },
        {
          id: 2,
          name: "Barcelona",
          lat: 41.3851,
          lon: 2.1734,
          live: true,
          weather: {
            condition: "Loading...",
            temp: "--",
            icon: "Cloud",
            alert: false,
          },
          crowd: {
            levelKey: "live.highDensity",
            value: 81,
            trend: "Stable",
            trendIcon: "Minus",
            color: "text-red-500",
            barColor: "bg-red-300",
          },
          alternative: "Visit during off-peak hours (early morning or evening)",
        },
        {
          id: 3,
          name: "Copenhagen",
          lat: 55.6761,
          lon: 12.5683,
          live: true,
          weather: {
            condition: "Loading...",
            temp: "--",
            icon: "Cloud",
            alert: false,
          },
          crowd: {
            levelKey: "live.mediumDensity",
            value: 56,
            trend: "Up",
            trendIcon: "TrendingUp",
            color: "text-orange-500",
            barColor: "bg-orange-300",
          },
          alternative: "Consider indoor activities or postpone visit",
        },
        {
          id: 4,
          name: "Berlin",
          lat: 52.52,
          lon: 13.405,
          live: true,
          weather: {
            condition: "Loading...",
            temp: "--",
            icon: "Cloud",
            alert: false,
          },
          crowd: {
            levelKey: "live.mediumDensity",
            value: 61,
            trend: "Down",
            trendIcon: "TrendingDown",
            color: "text-orange-500",
            barColor: "bg-orange-300",
          },
          alternative: null,
        },
      ],
      refreshInterval: null, // For auto-refresh
    };
=======
const language = ref(getLanguage());
const hasUpcomingTrip = ref(true);
const trip = ref({
  title: "European Adventure",
  status: "Departure in 24 hours",
  from: "Paris",
  to: "Berlin",
  type: "Train",
  date: "12/17/2025",
  time: "08:30 AM",
});
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
>>>>>>> master
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
<<<<<<< HEAD
  mounted() {
    this.fetchUpcomingTrip();
    this.fetchNotifications();
    this.checkWeatherAndNotify();
    this.checkCrowdAndNotify();

    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing weather, crowd, and notifications...");
      this.fetchUpcomingTrip();
      this.fetchNotifications();
      this.checkWeatherAndNotify();
      this.checkCrowdAndNotify();
    }, 30000); // 30 seconds

    window.addEventListener("languageChanged", this.handleLanguageChange);
=======
  {
    id: 4,
    type: "weather",
    city: "Amsterdam",
    time: "3:35:58 PM",
    message: "Weather conditions updated",
    icon: "Cloud",
    color: "bg-blue-100 text-blue-600",
>>>>>>> master
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
<<<<<<< HEAD
  methods: {
    handleLanguageChange(event) {
      this.language = event.detail.language;
    },
    dismissReminder() {
      this.hasUpcomingTrip = false;
    },
    viewTripDetails() {
      this.router.push("/world");
    },
    async markAllRead() {
      const userId = this.getUserId();
      if (!userId) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/notifications/mark-all-read/${userId}`,
          { method: "PUT" }
        );

        if (response.ok) {
          this.notifications = this.notifications.map((n) => ({
            ...n,
            isRead: true,
          }));
          alert("All notifications marked as read!");
        }
      } catch (error) {
        console.error("Failed to mark all as read:", error);
      }
    },
    getUserId() {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user._id || user.id;
    },
    // Fetch upcoming trip (within 24 hours)
    async fetchUpcomingTrip() {
      const userId = this.getUserId();
      if (!userId) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/trips/upcoming/${userId}`
        );
        const trips = await response.json();

        if (trips && trips.length > 0) {
          const upcomingTrip = trips[0];
          const segment = upcomingTrip.itinerary[0];
          
          // Calculate hours until departure
          const now = new Date();
          const departureTime = new Date(segment.startTime);
          const hoursUntil = Math.round((departureTime - now) / (1000 * 60 * 60));
          
          this.trip = {
            id: upcomingTrip._id,
            title: upcomingTrip.title,
            status: `Departure in ${hoursUntil} hours`,
            from: segment.fromLocation.name,
            to: segment.toLocation.name,
            type: segment.transportMode.charAt(0).toUpperCase() + segment.transportMode.slice(1),
            date: new Date(segment.startTime).toLocaleDateString(),
            time: new Date(segment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          this.hasUpcomingTrip = true;
          console.log("✈️ Upcoming trip loaded:", this.trip);
        } else {
          this.hasUpcomingTrip = false;
          this.trip = null;
          console.log("📭 No upcoming trips found");
        }
      } catch (error) {
        console.error("Failed to fetch upcoming trip:", error);
        this.hasUpcomingTrip = false;
      }
    },
    // Fetch notifications from backend
    async fetchNotifications() {
      const userId = this.getUserId();
      if (!userId) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/notifications/${userId}?limit=20`
        );
        const data = await response.json();

        if (data.success) {
          console.log("📥 Received notifications:", data.notifications.length);
          this.notifications = data.notifications.map((n) => ({
            id: n._id,
            type: n.type,
            city: n.city || "N/A",
            time: new Date(n.createdAt).toLocaleTimeString(),
            message: n.message,
            icon: n.icon || "Bell",
            color: this.getNotificationColor(n.type),
            isRead: n.isRead,
          }));
          console.log("📋 Processed notifications:", this.notifications.length);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    },
    // Check weather and create notifications
    async checkWeatherAndNotify() {
      const userId = this.getUserId();
      if (!userId) return;

      const locations = this.locations.map((loc) => ({
        name: loc.name,
        lat: loc.lat,
        lon: loc.lon,
      }));

      try {
        const response = await fetch(
          `http://localhost:3000/api/notifications/weather/${userId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locations }),
          }
        );

        const data = await response.json();

        if (data.success && data.weatherData) {
          // Update locations with weather data
          data.weatherData.forEach((weather) => {
            const loc = this.locations.find((l) => l.name === weather.city);
            if (loc && !weather.error) {
              loc.weather.temp = `${weather.temperature}°C`;
              loc.weather.condition = weather.condition;
              loc.weather.windSpeed = weather.windSpeed || null;
              loc.weather.icon = weather.icon;
              loc.weather.alert = weather.alert;
            }
          });

          // Refresh notifications if new alerts were created
          if (data.alertsCreated > 0) {
            this.fetchNotifications();
          }
        }
      } catch (error) {
        console.error("Failed to check weather:", error);
      }
    },
    // Check crowd density and create notifications
    async checkCrowdAndNotify() {
      const userId = this.getUserId();
      if (!userId) return;

      const locations = this.locations.map((loc) => ({
        name: loc.name,
        lat: loc.lat,
        lon: loc.lon,
      }));

      try {
        const response = await fetch(
          `http://localhost:3000/api/notifications/crowd/${userId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locations }),
          }
        );

        const data = await response.json();

        if (data.success && data.crowdData) {
          // Update locations with crowd data
          data.crowdData.forEach((crowd) => {
            const loc = this.locations.find((l) => l.name === crowd.location);
            if (loc) {
              loc.crowd.value = crowd.density;
              loc.crowd.levelKey = crowd.levelKey;
              loc.crowd.trend = crowd.trend;
              loc.crowd.trendIcon = crowd.icon;
              loc.crowd.color = crowd.color;
              loc.crowd.barColor = crowd.barColor;
              loc.alternative = crowd.alternative;
            }
          });

          // Refresh notifications if new alerts were created
          if (data.alertsCreated > 0) {
            this.fetchNotifications();
          }
        }
      } catch (error) {
        console.error("Failed to check crowd density:", error);
      }
    },
    getNotificationColor(type) {
      const colors = {
        weather: "bg-blue-100 text-blue-600",
        social: "bg-purple-100 text-purple-600",
        location: "bg-emerald-100 text-emerald-600",
        tourist: "bg-yellow-100 text-yellow-600",
        transport: "bg-orange-100 text-orange-600",
      };
      return colors[type] || "bg-gray-100 text-gray-600";
    },
    getNotificationDotColor(type) {
      const colors = {
        weather: "bg-blue-500",
        tourist: "bg-red-500",
        transport: "bg-orange-500",
        social: "bg-purple-500",
        location: "bg-emerald-500",
      };
      return colors[type] || "bg-emerald-500";
    },
    // changing codes to icons ---
    getWeatherInfo(code) {
      if (code === 0) return { text: "Sunny", icon: "Sun", alert: false };
      if (code <= 3)
        return { text: "Partly Cloudy", icon: "CloudSun", alert: false };
      if (code <= 48) return { text: "Foggy", icon: "Cloud", alert: true };
      if (code <= 67) return { text: "Rainy", icon: "CloudRain", alert: true };
      if (code <= 77) return { text: "Snowy", icon: "Snowflake", alert: true };
      if (code <= 82)
        return { text: "Showers", icon: "CloudRain", alert: true };
      if (code <= 99)
        return { text: "Stormy", icon: "CloudLightning", alert: true };
      return { text: "Unknown", icon: "Cloud", alert: false };
    },
=======
  {
    id: 6,
    type: "location",
    city: "Copenhagen",
    time: "3:27:58 PM",
    message: "New eco-friendly location recommended",
    icon: "MapPin",
    color: "bg-emerald-100 text-emerald-600",
>>>>>>> master
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

const locations = ref([
  {
    id: 1,
    name: "Amsterdam",
    lat: 52.3676,
    lon: 4.9041,
    live: true,
    weather: {
      condition: "Loading...",
      temp: "--",
      icon: "Cloud",
      alert: false,
    },
    crowd: {
      levelKey: "live.lowDensity",
      value: 45,
      trend: "Up",
      trendIcon: "TrendingUp",
      color: "text-emerald-600",
      barColor: "bg-emerald-300",
    },
    alternative: null,
  },
  {
    id: 2,
    name: "Barcelona",
    lat: 41.3851,
    lon: 2.1734,
    live: true,
    weather: {
      condition: "Loading...",
      temp: "--",
      icon: "Cloud",
      alert: false,
    },
    crowd: {
      levelKey: "live.highDensity",
      value: 81,
      trend: "Stable",
      trendIcon: "Minus",
      color: "text-red-500",
      barColor: "bg-red-300",
    },
    alternative: "Visit during off-peak hours (early morning or evening)",
  },
  {
    id: 3,
    name: "Copenhagen",
    lat: 55.6761,
    lon: 12.5683,
    live: true,
    weather: {
      condition: "Loading...",
      temp: "--",
      icon: "Cloud",
      alert: false,
    },
    crowd: {
      levelKey: "live.mediumDensity",
      value: 56,
      trend: "Up",
      trendIcon: "TrendingUp",
      color: "text-orange-500",
      barColor: "bg-orange-300",
    },
    alternative: "Consider indoor activities or postpone visit",
  },
  {
    id: 4,
    name: "Berlin",
    lat: 52.52,
    lon: 13.405,
    live: true,
    weather: {
      condition: "Loading...",
      temp: "--",
      icon: "Cloud",
      alert: false,
    },
    crowd: {
      levelKey: "live.mediumDensity",
      value: 61,
      trend: "Down",
      trendIcon: "TrendingDown",
      color: "text-orange-500",
      barColor: "bg-orange-300",
    },
    alternative: null,
  },
]);
const refreshInterval = ref(null);

// Component map for dynamic icon rendering
const iconComponents = {
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
  Snowflake,
  CloudLightning,
};

const t = computed(() => (key) => translate(key, language.value));

const notificationFilter = ref("all"); // all, weather, tourist, social, location, transport

const filteredNotifications = computed(() => {
  if (notificationFilter.value === "all") {
    return notifications.value;
  }
  return notifications.value.filter((n) => n.type === notificationFilter.value);
});

const setFilter = (type) => {
  notificationFilter.value = type;
};

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

const dismissReminder = () => {
  hasUpcomingTrip.value = false;
};

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user._id || user.id;
};

const markAllRead = async () => {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/notifications/mark-all-read/${userId}`,
      { method: "PUT" }
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

const fetchNotifications = async () => {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/notifications/${userId}?limit=20`
    );
    const data = await response.json();

    if (data.success) {
      console.log("📥 Received notifications:", data.notifications.length);

      // Map notifications
      const allNotifications = data.notifications.map((n) => ({
        id: n._id,
        type: n.type,
        city: n.city || "N/A",
        time: new Date(n.createdAt).toLocaleTimeString(),
        message: n.message,
        icon: n.icon || "Bell",
        color: getNotificationColor(n.type),
        isRead: n.isRead,
        createdAt: new Date(n.createdAt),
      }));

      // Deduplicate: Keep only latest notification per city+type
      const seen = new Map();
      const deduplicated = [];

      for (const notif of allNotifications) {
        const key = `${notif.city}-${notif.type}`;
        if (!seen.has(key)) {
          seen.set(key, true);
          deduplicated.push(notif);
        }
      }

      // Mix notification types for more natural appearance
      const byType = {};
      deduplicated.forEach((n) => {
        if (!byType[n.type]) byType[n.type] = [];
        byType[n.type].push(n);
      });

      // Interleave different types
      const mixed = [];
      const types = Object.keys(byType);
      let maxLength = Math.max(
        ...Object.values(byType).map((arr) => arr.length)
      );

      for (let i = 0; i < maxLength; i++) {
        types.forEach((type) => {
          if (byType[type][i]) {
            mixed.push(byType[type][i]);
          }
        });
      }

      notifications.value = mixed;
      console.log(
        "📋 Processed notifications (deduplicated & mixed):",
        notifications.value.length
      );
    }
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  }
};

const checkWeatherAndNotify = async () => {
  const userId = getUserId();
  if (!userId) return;

  const locs = locations.value.map((loc) => ({
    name: loc.name,
    lat: loc.lat,
    lon: loc.lon,
  }));

  try {
    const response = await fetch(
      `http://localhost:3000/api/notifications/weather/${userId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: locs }),
      }
    );

    const data = await response.json();

    if (data.success && data.weatherData) {
      // Update locations with weather data
      data.weatherData.forEach((weather) => {
        const loc = locations.value.find((l) => l.name === weather.city);
        if (loc && !weather.error) {
          loc.weather.temp = `${weather.temperature}°C`;
          loc.weather.condition = weather.condition;
          loc.weather.windSpeed = weather.windSpeed || null;
          loc.weather.icon = weather.icon;
          loc.weather.alert = weather.alert;
        }
      });

      // Refresh notifications if new alerts were created
      if (data.alertsCreated > 0) {
        fetchNotifications();
      }
    }
  } catch (error) {
    console.error("Failed to check weather:", error);
  }
};

const checkCrowdAndNotify = async () => {
  const userId = getUserId();
  if (!userId) return;

  const locs = locations.value.map((loc) => ({
    name: loc.name,
    lat: loc.lat,
    lon: loc.lon,
  }));

  try {
    const response = await fetch(
      `http://localhost:3000/api/notifications/crowd/${userId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: locs }),
      }
    );

    const data = await response.json();

    if (data.success && data.crowdData) {
      // Update locations with crowd data
      data.crowdData.forEach((crowd) => {
        const loc = locations.value.find((l) => l.name === crowd.location);
        if (loc) {
          loc.crowd.value = crowd.density;
          loc.crowd.levelKey = crowd.levelKey;
          loc.crowd.trend = crowd.trend;
          loc.crowd.trendIcon = crowd.icon;
          loc.crowd.color = crowd.color;
          loc.crowd.barColor = crowd.barColor;
          loc.alternative = crowd.alternative;
        }
      });

      // Refresh notifications if new alerts were created
      if (data.alertsCreated > 0) {
        fetchNotifications();
      }
    }
  } catch (error) {
    console.error("Failed to check crowd density:", error);
  }
};

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

onMounted(() => {
  fetchNotifications();
  checkWeatherAndNotify();
  checkCrowdAndNotify();

  // Auto-refresh every 30 seconds
  refreshInterval.value = setInterval(() => {
    console.log("🔄 Auto-refreshing weather, crowd, and notifications...");
    fetchNotifications();
    checkWeatherAndNotify();
    checkCrowdAndNotify();
  }, 30000);

  window.addEventListener("languageChanged", handleLanguageChange);
});

onBeforeUnmount(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
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
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-2">
            <Bell class="w-5 h-5 text-emerald-600" />
            <h3 class="font-bold text-lg text-gray-900">
              {{ t("live.notifications") }}
            </h3>
            <span
              class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
              >10 {{ t("live.new") }}</span
            >
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {{ t("live.liveUpdates") }}
          </p>
        </div>
        <button
          @click="markAllRead"
          class="text-xs font-medium text-gray-600 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 transition-colors"
        >
          {{ t("live.markAllRead") }}
        </button>
      </div>

      <!-- Filter Buttons -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button
          @click="setFilter('all')"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            notificationFilter === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          All ({{ notifications.length }})
        </button>
        <button
          @click="setFilter('weather')"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            notificationFilter === 'weather'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          ☁️ Weather ({{
            notifications.filter((n) => n.type === "weather").length
          }})
        </button>
        <button
          @click="setFilter('tourist')"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            notificationFilter === 'tourist'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          ⚠️ Tourist ({{
            notifications.filter((n) => n.type === "tourist").length
          }})
        </button>
        <button
          @click="setFilter('social')"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            notificationFilter === 'social'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          💬 Social ({{
            notifications.filter((n) => n.type === "social").length
          }})
        </button>
        <button
          @click="setFilter('location')"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            notificationFilter === 'location'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          📍 Location ({{
            notifications.filter((n) => n.type === "location").length
          }})
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in filteredNotifications"
          :key="item.id"
          class="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 transition-colors cursor-pointer group"
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

          <div class="flex items-center pr-2">
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
