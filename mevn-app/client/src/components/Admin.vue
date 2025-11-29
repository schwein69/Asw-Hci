<script>
export default {
  name: "Admin",
};
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Admin Settings</h2>
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100"
    >
      <a
        href="#"
        class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
          >
            <i class="fa-regular fa-user"></i>
          </div>
          <span class="font-medium text-gray-700">User Management</span>
        </div>
        <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
      </a>
      <a
        href="#"
        class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"
          >
            <i class="fa-solid fa-sliders"></i>
          </div>
          <span class="font-medium text-gray-700">App Configuration</span>
        </div>
        <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
      </a>
      <a
        href="#"
        class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"
          >
            <i class="fa-solid fa-power-off"></i>
          </div>
          <span class="font-medium text-gray-700">System Logs</span>
        </div>
        <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
      </a>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
