<script>
import {
  Clock,
  Bell,
  MapPin,
  Calendar,
  TrainFront,
  AlertTriangle,
  Info,
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
  },
  data() {
    return {
      // Change this to false to see the "No upcoming reminders" state initially
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
    };
  },
  methods: {
    dismissReminder() {
      this.hasUpcomingTrip = false;
    },
  },
};
</script>

<template>
  <div class="space-y-6 pb-10 max-w-5xl mx-auto">
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
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
