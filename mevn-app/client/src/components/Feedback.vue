<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
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

// Reactive state
const language = ref(getLanguage());
const averageRating = ref(4.5);
const totalFeedback = ref(4);
const implementationRate = ref("25%");

// Form data
const userRating = ref(0);
const selectedCategory = ref("");
const subject = ref("");
const message = ref("");
const isSubmitting = ref(false);

// Report user specific
const allUsers = ref([]);
const selectedUserToReport = ref("");
const isLoadingUsers = ref(false);

const categories = [
  { key: "feedback.featureRequest", emoji: "💡" },
  { key: "feedback.bugReport", emoji: "🐛" },
  { key: "feedback.improvement", emoji: "⚡" },
  { key: "feedback.generalFeedback", emoji: "💬" },
  { key: "feedback.reportUser", emoji: "🚨" },
];

const communityFeedback = ref([]);
const isLoading = ref(false);

// Icon mapping for dynamic components
const iconComponents = {
  Lightbulb,
  Bug,
  Zap,
};

// Computed properties
const t = computed(() => {
  return (key) => translate(key, language.value);
});

const isReportUser = computed(() => {
  return selectedCategory.value === "feedback.reportUser";
});

// Methods
const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user._id || user.id;
};

// Fetch all users for report dropdown
const fetchAllUsers = async () => {
  isLoadingUsers.value = true;
  try {
    const response = await fetch("http://localhost:3000/api/users/all");
    const users = await response.json();

    // Exclude current user from the list
    const currentUserId = getUserId();
    allUsers.value = users.filter((u) => u._id !== currentUserId);

    console.log("Loaded users:", allUsers.value.length);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  } finally {
    isLoadingUsers.value = false;
  }
};

// Fetch community feedback from backend
const fetchCommunityFeedback = async () => {
  isLoading.value = true;
  try {
    const response = await fetch("http://localhost:3000/api/feedback?limit=20");
    const data = await response.json();

    if (data.success) {
      // Update stats
      averageRating.value = data.stats.averageRating;
      totalFeedback.value = data.stats.totalFeedback;
      implementationRate.value = data.stats.implementationRate;

      // Map feedbacks to display format
      communityFeedback.value = data.feedbacks.map((f) => ({
        id: f._id,
        title: f.subject,
        status: f.status,
        user: f.userName,
        time: getTimeAgo(f.createdAt),
        rating: f.rating,
        text: f.message,
        upvotes: f.upvotes,
        category: getCategoryDisplay(f.category),
        icon: getCategoryIcon(f.category),
        hasUpvoted: false, // Will be updated if user is logged in
      }));

      console.log("✅ Loaded feedback:", communityFeedback.value.length);
    }
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
  } finally {
    isLoading.value = false;
  }
};

// Helper to get time ago string
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
};

// Get category display name
const getCategoryDisplay = (categoryKey) => {
  const map = {
    "feedback.featureRequest": "Feature Request",
    "feedback.bugReport": "Bug Report",
    "feedback.improvement": "Improvement",
    "feedback.generalFeedback": "General Feedback",
  };
  return map[categoryKey] || "General Feedback";
};

// Get category icon
const getCategoryIcon = (categoryKey) => {
  const map = {
    "feedback.featureRequest": "Lightbulb",
    "feedback.bugReport": "Bug",
    "feedback.improvement": "Zap",
    "feedback.generalFeedback": "Lightbulb",
  };
  return map[categoryKey] || "Lightbulb";
};

const submitFeedback = async () => {
  // Validation: check if category is selected
  if (!selectedCategory.value) {
    alert(t.value("feedback.pleaseSelectCategory"));
    return;
  }

  // For normal feedback (not report user), require rating
  if (!isReportUser.value && !userRating.value) {
    alert(t.value("feedback.pleaseSelectCategory"));
    return;
  }

  // For report user, require user selection
  if (isReportUser.value && !selectedUserToReport.value) {
    alert("Please select a user to report");
    return;
  }

  const userId = getUserId();
  if (!userId) {
    alert("Please login to submit feedback");
    return;
  }

  isSubmitting.value = true;
  try {
    // Get the reported user's name if reporting
    let reportedUserName = "";
    if (isReportUser.value) {
      const reportedUser = allUsers.value.find(
        (u) => u._id === selectedUserToReport.value
      );
      reportedUserName = reportedUser ? reportedUser.username : "Unknown User";
    }

    const response = await fetch("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        category: selectedCategory.value,
        subject: isReportUser.value
          ? `Report User: ${reportedUserName}`
          : subject.value || "Feedback",
        message: isReportUser.value
          ? `User ID: ${selectedUserToReport.value}`
          : message.value || "No additional comments provided.",
        rating: isReportUser.value ? 1 : userRating.value,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert(t.value("feedback.thankYouSubmitted"));
      // Reset form
      userRating.value = 0;
      selectedCategory.value = "";
      subject.value = "";
      message.value = "";
      selectedUserToReport.value = "";
      // Reload feedback list
      fetchCommunityFeedback();
    } else {
      alert(data.message || "Failed to submit feedback");
    }
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    alert("Failed to submit feedback. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleUpvote = async (id) => {
  const userId = getUserId();
  if (!userId) {
    alert("Please login to upvote");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/feedback/${id}/upvote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // Update local state
      const item = communityFeedback.value.find((i) => i.id === id);
      if (item) {
        item.upvotes = data.feedback.upvotes;
        item.hasUpvoted = data.feedback.hasUpvoted;
      }
    }
  } catch (error) {
    console.error("Failed to upvote:", error);
  }
};

const getStatusColor = (status) => {
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
};

const translateStatus = (status) => {
  const statusMap = {
    Implemented: t.value("feedback.implemented"),
    Reviewing: t.value("feedback.reviewing"),
    New: t.value("feedback.new"),
  };
  return statusMap[status] || status;
};

const translateCategory = (category) => {
  const categoryMap = {
    "Feature Request": t.value("feedback.featureRequest"),
    "Bug Report": t.value("feedback.bugReport"),
    Improvement: t.value("feedback.improvement"),
    "General Feedback": t.value("feedback.generalFeedback"),
  };
  return categoryMap[category] || category;
};

const translateTime = (timeStr) => {
  if (timeStr.includes("week")) {
    const num = timeStr.match(/\d+/)?.[0] || "1";
    return num === "1"
      ? t.value("feedback.weekAgo")
      : `${num} ${t.value("feedback.weeksAgo")}`;
  }
  if (timeStr.includes("day")) {
    const num = timeStr.match(/\d+/)?.[0] || "1";
    return num === "1"
      ? t.value("feedback.dayAgo")
      : `${num} ${t.value("feedback.daysAgo")}`;
  }
  return timeStr;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
  fetchCommunityFeedback(); // Load feedback on mount
});

onBeforeUnmount(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});
</script>

<template>
  <div
    class="space-y-8 pb-10 bg-emerald-50 dark:bg-gray-900 min-h-screen p-6 transition-colors duration-300"
  >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">
          {{ t("feedback.averageUserRating") }}
        </p>
        <div class="flex items-center gap-2">
          <Star class="w-5 h-5 text-yellow-500 fill-current" />
          <span class="text-2xl font-bold text-gray-800"
            >{{ averageRating }} / 5</span
          >
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">
          {{ t("feedback.totalFeedback") }}
        </p>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-gray-800">{{
            totalFeedback
          }}</span>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <p class="text-gray-500 text-sm mb-1">
          {{ t("feedback.implementationRate") }}
        </p>
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
        <h3 class="text-lg font-bold text-gray-800">
          {{ t("feedback.submitFeedback") }}
        </h3>
      </div>
      <p class="text-sm text-gray-500 mb-6">
        {{ t("feedback.helpUsImprove") }}
      </p>

      <form @submit.prevent="submitFeedback" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700 ml-1">{{
              t("feedback.category")
            }}</label>
            <div class="relative">
              <select
                v-model="selectedCategory"
                @change="
                  selectedCategory === 'feedback.reportUser' && fetchAllUsers()
                "
                class="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                :class="
                  selectedCategory === '' ? 'text-gray-900' : 'text-gray-900'
                "
              >
                <option value="" disabled selected>
                  {{ t("feedback.selectCategory") }}
                </option>
                <option
                  v-for="cat in categories"
                  :key="cat.key"
                  :value="cat.key"
                  class="text-gray-900"
                >
                  {{ t(cat.key) }}
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

          <div v-if="!isReportUser" class="space-y-1">
            <label class="text-xs font-bold text-gray-700 ml-1">{{
              t("feedback.yourRating")
            }}</label>
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

        <!-- User selector for Report User -->
        <div v-if="isReportUser" class="space-y-1">
          <label class="text-xs font-bold text-gray-700 ml-1"
            >Select User to Report</label
          >
          <div class="relative">
            <select
              v-model="selectedUserToReport"
              class="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" disabled selected>
                {{ isLoadingUsers ? "Loading users..." : "Select a user" }}
              </option>
              <option
                v-for="user in allUsers"
                :key="user._id"
                :value="user._id"
                class="text-gray-900"
              >
                {{ user.username }} ({{ user.email }})
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

        <div v-if="!isReportUser" class="space-y-1">
          <label class="text-xs font-bold text-gray-700 ml-1">{{
            t("feedback.subject")
          }}</label>
          <input
            v-model="subject"
            type="text"
            :placeholder="t('feedback.subjectPlaceholder')"
            class="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900"
          />
        </div>

        <div v-if="!isReportUser" class="space-y-1">
          <label class="text-xs font-bold text-gray-700 ml-1">{{
            t("feedback.message")
          }}</label>
          <textarea
            v-model="message"
            rows="4"
            :placeholder="t('feedback.messagePlaceholder')"
            class="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-gray-900"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
          :class="[
            isReportUser
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white',
            { 'opacity-70 cursor-not-allowed': isSubmitting },
          ]"
          :disabled="isSubmitting"
        >
          <Send class="w-4 h-4" />
          {{
            isSubmitting
              ? t("feedback.submitting")
              : isReportUser
              ? "Report User"
              : t("feedback.submitFeedbackButton")
          }}
        </button>
      </form>
    </div>

    <div class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm">
      <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-800">
          {{ t("feedback.communityFeedback") }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ t("feedback.browseAndVote") }}
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
              <component :is="iconComponents[item.icon]" class="w-5 h-5" />
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
              {{ t("feedback.upvote") }} ({{ item.upvotes }})
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
