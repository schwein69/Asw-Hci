<script>
export default {
  name: "Discover",
};
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">
      Discover Sustainable Stays
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="n in 3"
        :key="n"
        class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition-shadow"
      >
        <div class="h-40 bg-gray-200 relative">
          <!-- Placeholder for image -->
          <div
            class="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100"
          >
            <i class="fa-regular fa-image text-3xl"></i>
          </div>
          <div
            class="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-eco-brand"
          >
            Eco-Certified
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-800">Green Leaf Hotel</h3>
          <p class="text-sm text-gray-500 mt-1">San Francisco, CA</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="text-sm font-medium text-gray-900"
              >$120<span class="text-gray-400 font-normal">/night</span></span
            >
            <i
              class="fa-regular fa-heart text-gray-400 hover:text-red-500 transition-colors"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
