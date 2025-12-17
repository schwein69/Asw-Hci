<script>
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
} from "lucide-vue-next";

export default {
  name: "Live",
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
  },
  data() {
    return {
      hasUpcomingTrip: true,
      trip: {
        title: "European Adventure",
        status: "Departure in 24 hours",
        from: "Paris",
        to: "Berlin",
        type: "Train",
        date: "12/17/2025",
        time: "08:30 AM",
      },
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
      // Live Location Insights Data
      locations: [
        {
          id: 1,
          name: "Amsterdam",
          live: true,
          weather: {
            condition: "Sunny",
            temp: "18°C",
            icon: "Sun",
            alert: false,
          },
          crowd: {
            level: "Low Density",
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
          live: true,
          weather: {
            condition: "Partly Cloudy",
            temp: "24°C",
            icon: "CloudSun",
            alert: false,
          },
          crowd: {
            level: "High Density",
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
          live: true,
          weather: {
            condition: "Windy",
            temp: "14°C",
            icon: "Wind",
            alert: true,
          },
          crowd: {
            level: "Medium Density",
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
          live: true,
          weather: {
            condition: "Rainy",
            temp: "16°C",
            icon: "CloudRain",
            alert: false,
          },
          crowd: {
            level: "Medium Density",
            value: 61,
            trend: "Down",
            trendIcon: "TrendingDown",
            color: "text-orange-500",
            barColor: "bg-orange-300",
          },
          alternative: null,
        },
      ],
    };
  },
  methods: {
    dismissReminder() {
      this.hasUpcomingTrip = false;
    },
    markAllRead() {
      alert("All notifications marked as read!");
    },
  },
};
</script>

<template>
  <div class="space-y-8 pb-10 max-w-5xl mx-auto">
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6">
      <div class="flex items-center gap-2 mb-1 text-amber-900">
        <Clock class="w-5 h-5" />
        <h3 class="font-bold text-lg">Upcoming Travel Reminders</h3>
      </div>
      <p class="text-amber-800/70 text-sm mb-6">
        Don't miss your departure - 24-hour advance notifications
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
              <p class="text-gray-500 text-sm">{{ trip.status }}</p>
            </div>
          </div>
          <span
            class="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
          >
            <Bell class="w-3 h-3 fill-current" /> New
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
                <MapPin class="w-3.5 h-3.5" /> Route
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
                <TrainFront class="w-3.5 h-3.5" /> Transport
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
                <Calendar class="w-3.5 h-3.5" /> Date
              </p>
              <span class="font-semibold text-gray-800">{{ trip.date }}</span>
            </div>

            <div>
              <p
                class="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-1"
              >
                <Clock class="w-3.5 h-3.5" /> Departure Time
              </p>
              <span class="font-semibold text-gray-800">{{ trip.time }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            <Info class="w-4 h-4" /> View Trip Details
          </button>
          <button
            @click="dismissReminder"
            class="px-6 border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold py-2.5 rounded-lg transition-colors"
          >
            Dismiss
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
        <p class="text-gray-600 font-medium">No upcoming travel reminders</p>
        <p class="text-gray-400 text-sm">
          You'll be notified 24 hours before your trips
        </p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-2">
            <Bell class="w-5 h-5 text-emerald-600" />
            <h3 class="font-bold text-lg text-gray-900">
              Real-Time Notifications
            </h3>
            <span
              class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
              >10 new</span
            >
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Live updates on weather, crowds, and social interactions
          </p>
        </div>
        <button
          @click="markAllRead"
          class="text-xs font-medium text-gray-600 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 transition-colors cursor-pointer group"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="item.color"
            >
              <component :is="item.icon" class="w-5 h-5" />
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
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
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
            <component :is="loc.weather.icon" class="w-5 h-5 text-sky-600" />
            <div>
              <p class="text-xs text-sky-800 font-bold">Weather</p>
              <p class="text-sm text-gray-700">{{ loc.weather.condition }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="loc.weather.alert"
              class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded"
            >
              <AlertTriangle class="w-3 h-3 inline mr-0.5" /> Alert
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
              <User class="w-3.5 h-3.5" /> Tourist Affluence
            </div>
            <div
              class="flex items-center gap-1 text-[10px] font-medium text-gray-500"
            >
              <component
                :is="loc.crowd.trendIcon"
                class="w-3 h-3"
                :class="
                  loc.crowd.trend === 'Up' ? 'text-red-500' : 'text-emerald-500'
                "
              />
              {{ loc.crowd.trend }}
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
            <span :class="loc.crowd.color">{{ loc.crowd.level }}</span>
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
                Alternative Suggested
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
