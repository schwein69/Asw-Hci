<script>
import {
  Shield,
  MessageCircle,
  UserCog,
  Settings,
  Save,
} from "lucide-vue-next";

export default {
  name: "Admin",
  components: {
    Shield,
    MessageCircle,
    UserCog,
    Settings,
    Save,
  },
  data() {
    return {
      stats: [
        { label: "Total Users", value: "1247" },
        { label: "Active Itineraries", value: "542" },
        { label: "Forum Posts", value: "3891" },
        { label: "Avg Eco Score", value: "87" },
      ],
      activeTab: "settings",
      platformName: "EcoVoyage",
      ecoScoreThreshold: 70,
      weatherSensitivity: 3,
      maintenanceMessage: "",
    };
  },
  methods: {
    saveSettings() {
      alert("System settings saved successfully!");
    },
  },
};
</script>

<template>
  <div class="space-y-6 pb-10">
    <div class="bg-emerald-600 text-white rounded-2xl p-6 shadow-md">
      <div class="flex items-center gap-3 mb-1">
        <Shield class="w-6 h-6" />
        <h2 class="text-xl font-bold">Admin Panel</h2>
      </div>
      <p class="text-emerald-100 text-sm opacity-90">
        General Administrator Access
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm"
      >
        <p class="text-gray-500 text-sm mb-2">{{ stat.label }}</p>
        <p class="text-3xl font-bold text-gray-800">{{ stat.value }}</p>
      </div>
    </div>

    <div
      class="bg-white rounded-xl p-1 border border-gray-100 shadow-sm flex overflow-x-auto"
    >
      <button
        @click="activeTab = 'forum'"
        class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'forum'
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-gray-600 hover:bg-gray-50'
        "
      >
        <MessageCircle class="w-4 h-4" />
        Forum Moderation
      </button>

      <button
        @click="activeTab = 'users'"
        class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'users'
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-gray-600 hover:bg-gray-50'
        "
      >
        <UserCog class="w-4 h-4" />
        User Management
      </button>

      <button
        @click="activeTab = 'settings'"
        class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'settings'
            ? 'bg-emerald-50 text-emerald-700 font-bold'
            : 'text-gray-600 hover:bg-gray-50'
        "
      >
        <Settings class="w-4 h-4" />
        System Settings
      </button>
    </div>

    <div
      v-if="activeTab === 'settings'"
      class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm"
    >
      <div class="mb-6">
        <h3 class="text-emerald-700 font-medium">System Settings</h3>
        <p class="text-sm text-gray-500">Configure platform parameters</p>
      </div>

      <form @submit.prevent="saveSettings" class="space-y-4">
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-800 ml-1"
            >Platform Name</label
          >
          <input
            v-model="platformName"
            type="text"
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-800 ml-1"
            >Default Eco Score Threshold</label
          >
          <input
            v-model="ecoScoreThreshold"
            type="number"
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-800 ml-1"
            >Weather Alert Sensitivity</label
          >
          <input
            v-model="weatherSensitivity"
            type="number"
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-800 ml-1"
            >Maintenance Message</label
          >
          <input
            v-model="maintenanceMessage"
            type="text"
            placeholder="Enter system-wide message for users..."
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          class="bg-emerald-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm mt-2"
        >
          Save Settings
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
