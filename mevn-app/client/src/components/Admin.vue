<script>
import { Shield } from "lucide-vue-next";

export default {
  name: "Admin",
  components: {
    Shield,
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
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
