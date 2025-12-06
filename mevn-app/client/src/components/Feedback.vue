<script>
import { Star, TrendingUp, Send, MessageSquare } from "lucide-vue-next";

export default {
  name: "Feedback",
  components: {
    Star,
    TrendingUp,
    Send,
    MessageSquare,
  },
  data() {
    return {
      // --- Stats Data ---
      averageRating: 4.5,
      totalFeedback: 4,
      implementationRate: "25%",

      // --- Form Data (New) ---
      userRating: 0,
      selectedCategory: "",
      subject: "",
      message: "",
      categories: [
        "General Feedback",
        "Bug Report",
        "Feature Request",
        "Sustainability Suggestion",
      ],
      isSubmitting: false,
    };
  },
  methods: {
    submitFeedback() {
      // Validate simple inputs
      if (!this.userRating || !this.selectedCategory) {
        alert("Please select a category and a rating.");
        return;
      }

      this.isSubmitting = true;

      // Simulate API call
      setTimeout(() => {
        alert("Thank you! Your feedback has been submitted.");
        this.isSubmitting = false;

        // Reset Form
        this.userRating = 0;
        this.selectedCategory = "";
        this.subject = "";
        this.message = "";
      }, 1000);
    },
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

    <div class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <div class="text-emerald-600">
          <MessageSquare class="w-5 h-5" />
        </div>
        <h3 class="text-lg font-bold text-gray-800">Submit Feedback</h3>
      </div>
      <p class="text-sm text-gray-500 mb-6">
        Help us improve EcoVoyage with your suggestions
      </p>

      <form @submit.prevent="submitFeedback" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700 ml-1">Category</label>
            <div class="relative">
              <select
                v-model="selectedCategory"
                class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled selected>Select category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
              <div
                class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700 ml-1"
              >Your Rating</label
            >
            <div class="flex gap-2 pt-2">
              <button
                type="button"
                v-for="star in 5"
                :key="star"
                @click="userRating = star"
                class="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  class="w-6 h-6"
                  :class="
                    star <= userRating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  "
                />
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-700 ml-1">Subject</label>
          <input
            v-model="subject"
            type="text"
            placeholder="Brief description of your feedback"
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-700 ml-1">Message</label>
          <textarea
            v-model="message"
            rows="4"
            placeholder="Provide detailed feedback..."
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-sm"
          :disabled="isSubmitting"
          :class="{ 'opacity-70 cursor-not-allowed': isSubmitting }"
        >
          <Send class="w-4 h-4" />
          {{ isSubmitting ? "Submitting..." : "Submit Feedback" }}
        </button>
      </form>
    </div>

    <div
      class="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl"
    ></div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
