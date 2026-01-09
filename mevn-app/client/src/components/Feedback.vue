<script>
import {
  Star,
  TrendingUp,
  Send,
  MessageSquare,
  ThumbsUp,
  Lightbulb,
  Bug,
  Zap,
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";

export default {
  name: "Feedback",
  components: {
    Star,
    TrendingUp,
    Send,
    MessageSquare,
    ThumbsUp,
    Lightbulb,
    Bug,
    Zap,
  },
  data() {
    return {
      language: getLanguage(),
      // --- Stats Data ---
      averageRating: 4.5,
      totalFeedback: 4,
      implementationRate: "25%",

      // --- Form Data ---
      userRating: 0,
      selectedCategory: "",
      subject: "",
      message: "",

      categories: [
        { key: "feedback.featureRequest", emoji: "💡" },
        { key: "feedback.bugReport", emoji: "🐛" },
        { key: "feedback.improvement", emoji: "⚡" },
        { key: "feedback.generalFeedback", emoji: "💬" },
      ],
      isSubmitting: false,

      // --- Community Feedback Data ---
      communityFeedback: [
        {
          id: 1,
          title: "Carbon offset marketplace",
          status: "Implemented",
          user: "Emma L.",
          time: "2 weeks ago",
          rating: 5,
          text: "It would be great to have a built-in marketplace to purchase carbon offsets.",
          upvotes: 42,
          category: "Feature Request",
          icon: "Lightbulb",
        },
        {
          id: 2,
          title: "Add bike-sharing integration",
          status: "Reviewing",
          user: "Sarah M.",
          time: "2 days ago",
          rating: 5,
          text: "Would love to see real-time bike-sharing availability integrated into the map!",
          upvotes: 23,
          category: "Feature Request",
          icon: "Lightbulb",
        },
        {
          id: 3,
          title: "Map zoom issue on mobile",
          status: "Reviewing",
          user: "Michael K.",
          time: "1 week ago",
          rating: 4,
          text: "The 3D map zoom functionality is not working properly on iOS devices.",
          upvotes: 15,
          category: "Bug Report",
          icon: "Bug",
        },
        {
          id: 4,
          title: "Better filtering options",
          status: "New",
          user: "Carlos R.",
          time: "3 days ago",
          rating: 4,
          text: "Add more filtering options for eco-certifications and dietary requirements.",
          upvotes: 8,
          category: "Improvement",
          icon: "Zap",
        },
      ],
    };
  },
  methods: {
    submitFeedback() {
      if (!this.userRating || !this.selectedCategory) {
        alert("Please select a category and a rating.");
        return;
      }
      this.isSubmitting = true;
      setTimeout(() => {
        alert("Thank you! Your feedback has been submitted.");
        this.isSubmitting = false;
        this.userRating = 0;
        this.selectedCategory = "";
        this.subject = "";
        this.message = "";
      }, 1000);
    },
    handleUpvote(id) {
      const item = this.communityFeedback.find((i) => i.id === id);
      if (item) {
        item.upvotes++;
      }
    },
    // REVERTED: Status colors stay the same in dark mode because cards are white
    getStatusColor(status) {
      switch (status) {
        case "Implemented":
          return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "Reviewing":
          return "bg-amber-100 text-amber-700 border-amber-200";
        case "New":
          return "bg-blue-100 text-blue-700 border-blue-200";
        default:
          return "bg-gray-100 text-gray-700 border-gray-200";
      }
    },
    translateStatus(status) {
      const statusMap = {
        'Implemented': this.t('feedback.implemented'),
        'Reviewing': this.t('feedback.reviewing'),
        'New': this.t('feedback.new')
      };
      return statusMap[status] || status;
    },
    translateCategory(category) {
      const categoryMap = {
        'Feature Request': this.t('feedback.featureRequest'),
        'Bug Report': this.t('feedback.bugReport'),
        'Improvement': this.t('feedback.improvement'),
        'General Feedback': this.t('feedback.generalFeedback')
      };
      return categoryMap[category] || category;
    },
    translateTime(timeStr) {
      if (timeStr.includes('week')) {
        const num = timeStr.match(/\d+/)?.[0] || '1';
        return num === '1' ? this.t('feedback.weekAgo') : `${num} ${this.t('feedback.weeksAgo')}`;
      }
      if (timeStr.includes('day')) {
        const num = timeStr.match(/\d+/)?.[0] || '1';
        return num === '1' ? this.t('feedback.dayAgo') : `${num} ${this.t('feedback.daysAgo')}`;
      }
      return timeStr;
    },
  },
  computed: {
    t() {
      return (key) => translate(key, this.language);
    },
  },
  mounted() {
    window.addEventListener('languageChanged', this.handleLanguageChange);
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this.handleLanguageChange);
  },
  methods: {
    handleLanguageChange(event) {
      this.language = event.detail.language;
    },
    submitFeedback() {
      if (!this.userRating || !this.selectedCategory) {
        alert(this.t('feedback.pleaseSelectCategory'));
        return;
      }
      this.isSubmitting = true;
      setTimeout(() => {
        alert(this.t('feedback.thankYouSubmitted'));
        this.isSubmitting = false;
        this.userRating = 0;
        this.selectedCategory = "";
        this.subject = "";
        this.message = "";
      }, 1000);
    },
    handleUpvote(id) {
      const item = this.communityFeedback.find((i) => i.id === id);
      if (item) {
        item.upvotes++;
      }
    },
    // REVERTED: Status colors stay the same in dark mode because cards are white
    getStatusColor(status) {
      switch (status) {
        case "Implemented":
          return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "Reviewing":
          return "bg-amber-100 text-amber-700 border-amber-200";
        case "New":
          return "bg-blue-100 text-blue-700 border-blue-200";
        default:
          return "bg-gray-100 text-gray-700 border-gray-200";
      }
    },
    translateStatus(status) {
      const statusMap = {
        'Implemented': this.t('feedback.implemented'),
        'Reviewing': this.t('feedback.reviewing'),
        'New': this.t('feedback.new')
      };
      return statusMap[status] || status;
    },
    translateCategory(category) {
      const categoryMap = {
        'Feature Request': this.t('feedback.featureRequest'),
        'Bug Report': this.t('feedback.bugReport'),
        'Improvement': this.t('feedback.improvement'),
        'General Feedback': this.t('feedback.generalFeedback')
      };
      return categoryMap[category] || category;
    },
    translateTime(timeStr) {
      if (timeStr.includes('week')) {
        const num = timeStr.match(/\d+/)?.[0] || '1';
        return num === '1' ? this.t('feedback.weekAgo') : `${num} ${this.t('feedback.weeksAgo')}`;
      }
      if (timeStr.includes('day')) {
        const num = timeStr.match(/\d+/)?.[0] || '1';
        return num === '1' ? this.t('feedback.dayAgo') : `${num} ${this.t('feedback.daysAgo')}`;
      }
      return timeStr;
    },
  },
};
</script>

<template>
  <div
    class="space-y-8 pb-10 bg-emerald-50 dark:bg-gray-900 min-h-screen p-6 transition-colors duration-300"
  >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">{{ t('feedback.averageUserRating') }}</p>
        <div class="flex items-center gap-2">
          <Star class="w-5 h-5 text-yellow-500 fill-current" />
          <span class="text-2xl font-bold text-gray-800"
            >{{ averageRating }} / 5</span
          >
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">{{ t('feedback.totalFeedback') }}</p>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-gray-800">{{
            totalFeedback
          }}</span>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">{{ t('feedback.implementationRate') }}</p>
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
        <h3 class="text-lg font-bold text-gray-800">{{ t('feedback.submitFeedback') }}</h3>
      </div>
      <p class="text-sm text-gray-500 mb-6">
        {{ t('feedback.helpUsImprove') }}
      </p>

      <form @submit.prevent="submitFeedback" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700 ml-1">{{ t('feedback.category') }}</label>
            <div class="relative">
              <select
                v-model="selectedCategory"
                class="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                :class="
                  selectedCategory === '' ? 'text-gray-900' : 'text-gray-900'
                "
              >
                <option value="" disabled selected>{{ t('feedback.selectCategory') }}</option>
                <option
                  v-for="cat in categories"
                  :key="cat.key"
                  :value="cat.key"
                  class="text-gray-900"
                >
                  {{ cat.emoji }} {{ t(cat.key) }}
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
              >{{ t('feedback.yourRating') }}</label
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
          <label class="text-xs font-bold text-gray-700 ml-1">{{ t('feedback.subject') }}</label>
          <input
            v-model="subject"
            type="text"
            :placeholder="t('feedback.subjectPlaceholder')"
            class="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-700 ml-1">{{ t('feedback.message') }}</label>
          <textarea
            v-model="message"
            rows="4"
            :placeholder="t('feedback.messagePlaceholder')"
            class="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-gray-900"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-sm"
          :disabled="isSubmitting"
          :class="{ 'opacity-70 cursor-not-allowed': isSubmitting }"
        >
          <Send class="w-4 h-4" />
          {{ isSubmitting ? t('feedback.submitting') : t('feedback.submitFeedbackButton') }}
        </button>
      </form>
    </div>

    <div class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm">
      <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-800">{{ t('feedback.communityFeedback') }}</h3>
        <p class="text-sm text-gray-500">
          {{ t('feedback.browseAndVote') }}
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="item in communityFeedback"
          :key="item.id"
          class="bg-white p-5 rounded-2xl border border-green-200 shadow-sm"
        >
          <div class="flex items-start gap-4 mb-2">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
              :class="
                item.icon === 'Bug'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-yellow-50 text-yellow-600 border-yellow-100'
              "
            >
              <component :is="item.icon" class="w-5 h-5" />
            </div>

            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h4 class="font-bold text-gray-900">{{ item.title }}</h4>
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-bold border"
                  :class="getStatusColor(item.status)"
                >
                  {{ translateStatus(item.status) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>{{ item.user }}</span>
                <span>•</span>
                <span>{{ translateTime(item.time) }}</span>
                <div class="flex items-center gap-0.5 ml-2">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    class="w-3 h-3"
                    :class="
                      i <= item.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          <p
            class="text-sm text-gray-800 mb-4 pl-14 leading-relaxed font-medium"
          >
            {{ item.text }}
          </p>

          <div class="flex items-center justify-between pl-14">
            <button
              @click="handleUpvote(item.id)"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors text-sm font-medium"
            >
              <ThumbsUp class="w-4 h-4" />
              {{ t('feedback.upvote') }} ({{ item.upvotes }})
            </button>
            <span
              class="text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full bg-white shadow-sm"
            >
              {{ translateCategory(item.category) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
