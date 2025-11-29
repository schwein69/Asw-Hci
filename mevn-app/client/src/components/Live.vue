<script>
export default {
  name: "Live",
};
</script>

<template>
  <div class="space-y-4 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl font-bold text-gray-800">Live Updates</h2>
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
      >
        <span class="w-2 h-2 mr-1 bg-red-500 rounded-full animate-pulse"></span>
        LIVE
      </span>
    </div>
    <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-eco-brand">
      <p class="text-gray-800 font-medium">Train delay on Line 4 (Paris)</p>
      <p class="text-sm text-gray-500 mt-1">
        Suggested alternative: Bus Route 22 (Electric)
      </p>
    </div>
    <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-400">
      <p class="text-gray-800 font-medium">Weather Alert: Heavy Rain</p>
      <p class="text-sm text-gray-500 mt-1">
        Consider indoor eco-activities today.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
