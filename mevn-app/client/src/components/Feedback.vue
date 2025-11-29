<script>
export default {
  name: "Feedback",
  data() {
    return {
      rating: 0,
    };
  },
};
</script>

<template>
  <div
    class="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
  >
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
      We value your input
    </h2>
    <div class="flex justify-center gap-2 mb-6">
      <button
        v-for="star in 5"
        :key="star"
        @click="rating = star"
        class="text-2xl transition-transform hover:scale-110 focus:outline-none"
        :class="star <= rating ? 'text-yellow-400' : 'text-gray-200'"
      >
        <i class="fa-solid fa-star"></i>
      </button>
    </div>
    <textarea
      class="w-full p-4 bg-gray-50 rounded-xl border-gray-200 focus:bg-white focus:ring-2 focus:ring-eco-brand focus:border-transparent transition-all mb-4"
      rows="4"
      placeholder="Tell us about your experience..."
    ></textarea>
    <button
      class="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
    >
      Submit Feedback
    </button>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
