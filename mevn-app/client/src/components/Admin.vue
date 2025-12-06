<script>
import { Shield } from "lucide-vue-next";

export default {
  name: "Admin",
  components: {
    Shield,
  },
  data() {
    return {
      // Data matching your screenshot
      stats: [
        { label: "Total Users", value: "1247" },
        { label: "Active Itineraries", value: "542" },
        { label: "Forum Posts", value: "3891" },
        { label: "Avg Eco Score", value: "87" },
      ],
    };
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
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
