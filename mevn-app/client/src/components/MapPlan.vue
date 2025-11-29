<script>
export default {
  name: "MapPlan",
};
</script>

<template>
  <div class="h-full flex flex-col h-[500px]">
    <div class="flex gap-4 mb-4">
      <input
        type="text"
        placeholder="Where to next?"
        class="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-eco-brand"
      />
      <button
        class="bg-eco-brand text-white px-6 py-3 rounded-xl hover:bg-green-700 font-medium"
      >
        Search
      </button>
    </div>
    <div
      class="flex-1 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 flex items-center justify-center relative overflow-hidden"
    >
      <div
        class="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"
      ></div>
      <div class="text-center z-10">
        <i class="fa-regular fa-map text-6xl text-blue-300 mb-4"></i>
        <p class="text-gray-500">Interactive Eco-Map would load here.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
