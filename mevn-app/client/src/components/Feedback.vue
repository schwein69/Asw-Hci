<script>
import { Star, TrendingUp } from "lucide-vue-next";

export default {
  name: "Feedback",
  components: {
    Star,
    TrendingUp,
  },
  data() {
    return {
      averageRating: 4.5,
      totalFeedback: 4,
      implementationRate: "25%",

      rating: 0,
    };
  },
};
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">Average User Rating</p>
        <div class="flex items-center gap-2">
          <Star class="w-5 h-5 text-yellow-500 fill-current" />
          <span class="text-2xl font-bold text-gray-800"
            >{{ averageRating }} / 5</span
          >
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">Total Feedback</p>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-gray-800">{{
            totalFeedback
          }}</span>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">Implementation Rate</p>
        <div class="flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-success" />
          <span class="text-2xl font-bold text-gray-800">{{
            implementationRate
          }}</span>
        </div>
      </div>
    </div>

    <div
      class="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl"
    ></div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
