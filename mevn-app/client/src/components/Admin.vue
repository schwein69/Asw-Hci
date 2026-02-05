<script>
import {
  Shield,
  MessageCircle,
  UserCog,
  Check,
  X,
  Flag,
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";
export default {
  name: "Admin",
  components: {
    Shield,
    MessageCircle,
    UserCog,
    Check,
    X,
    Flag,
  },
  inject: ["apiBase"],
  data() {
    return {
      language: getLanguage(),
      currentUserRole: null,
      // Stats Data
      stats: [
        { key: "totalUsers", labelKey: "admin.totalUsers", value: "—" },
        { key: "activeItineraries", labelKey: "admin.activeItineraries", value: "—" },
        { key: "forumPosts", labelKey: "admin.forumPosts", value: "—" },
        { key: "avgEcoScore", labelKey: "admin.avgEcoScore", value: "—" },
      ],
      isStatsLoading: false,

      // Tab State
      activeTab: "users",

      // User Management Data
      users: [],
      isUsersLoading: false,

      // Reported Users Data
      reportedFeedback: [],
      isReportsLoading: false,

      // Feedback (non-report) Data
      feedbackEntries: [],
      isFeedbackLoading: false,

      // --- NEW: Forum Moderation Data ---
      forumPosts: [],
      isForumLoading: false,
    };
  },
  computed: {
    t() {
      return (key) => translate(key, this.language);
    },
    isForumAdmin() {
      return this.currentUserRole === "AdminForum";
    },
    isGeneralAdmin() {
      return this.currentUserRole === "AdminGeneral";
    },
  },
  mounted() {
    this.language = getLanguage();
    window.addEventListener("languageChanged", this.handleLanguageChange);
    this.setCurrentUserRole();
    if (this.isForumAdmin) {
      this.activeTab = "forum";
      this.fetchStats();
      this.fetchForumPosts();
    }
    if (this.isGeneralAdmin) {
      this.activeTab = "users";
      this.fetchStats();
      this.fetchUsers();
      this.fetchReportedFeedback();
      this.fetchFeedbackEntries();
    }
  },
  beforeUnmount() {
    window.removeEventListener("languageChanged", this.handleLanguageChange);
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleDateString();
    },
    async fetchStats() {
      this.isStatsLoading = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${this.apiBase}/users/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch admin stats");
        }

        const data = await response.json();
        this.stats = this.stats.map((stat) => ({
          ...stat,
          value:
            data[stat.key] !== undefined && data[stat.key] !== null
              ? String(data[stat.key])
              : "—",
        }));
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        this.isStatsLoading = false;
      }
    },
    async fetchUsers() {
      this.isUsersLoading = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${this.apiBase}/users/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        this.users = data
          .filter((user) => user.role === "Standard")
          .map((user) => ({
            id: user._id,
            name: user.username,
            email: user.email,
            joined: this.formatDate(user.createdAt),
            role: user.role,
            status: user.status || "active",
            reports: user.numberOfReports || 0,
            initials: (user.username || "U").slice(0, 2).toUpperCase(),
          }));
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        this.isUsersLoading = false;
      }
    },
    async fetchReportedFeedback() {
      this.isReportsLoading = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${this.apiBase}/feedback/admin/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reported users");
        }

        const data = await response.json();
        this.reportedFeedback = (data.feedbacks || []).map((feedback) => ({
          id: feedback._id,
          reporter: feedback.userName,
          reportedUserName: feedback.reportedUserName || "Unknown",
          reportedUserId: feedback.reportedUserId || "",
          status: feedback.status,
          createdAt: this.formatDate(feedback.createdAt),
          subject: feedback.subject,
        }));
      } catch (error) {
        console.error("Error loading reported users:", error);
      } finally {
        this.isReportsLoading = false;
      }
    },
    async fetchFeedbackEntries() {
      this.isFeedbackLoading = true;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${this.apiBase}/feedback`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }

        const data = await response.json();
        this.feedbackEntries = (data.feedbacks || [])
          .filter((feedback) => feedback.category !== "feedback.reportUser")
          .map((feedback) => ({
            id: feedback._id,
            user: feedback.userName,
            subject: feedback.subject,
            message: feedback.message,
            category: feedback.category,
            status: feedback.status,
            createdAt: this.formatDate(feedback.createdAt),
          }));
      } catch (error) {
        console.error("Error loading feedback:", error);
      } finally {
        this.isFeedbackLoading = false;
      }
    },
    async fetchForumPosts() {
      this.isForumLoading = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${this.apiBase}/travelcards/moderation?status=Pending,Rejected,Approved`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch moderation posts");
        }

        const data = await response.json();
        this.forumPosts = data.cards.map((card) => ({
          id: card._id,
          author: card.creator?.username || "Unknown",
          initials: (card.creator?.username || "U").slice(0, 2).toUpperCase(),
          time: this.formatDate(card.createdAt),
          content: card.description,
          status: card.status.toLowerCase(),
          reports: card.numberOfReports || 0,
        }));
      } catch (error) {
        console.error("Error loading moderation posts:", error);
      } finally {
        this.isForumLoading = false;
      }
    },
    setCurrentUserRole() {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          this.currentUserRole = parsedUser?.role || null;
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        this.currentUserRole = null;
      }
    },
    handleLanguageChange(event) {
      this.language = event.detail.language;
    },
    async toggleUserStatus(user) {
      const newStatus = user.status === "active" ? "suspended" : "active";
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${this.apiBase}/users/${user.id}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update user status");
        }

        user.status = newStatus;
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    },
    getRoleColor(role) {
      return role === "admin" ||
        role === "AdminGeneral" ||
        role === "AdminForum"
        ? "bg-blue-100 text-blue-600"
        : "bg-gray-100 text-gray-600";
    },
    getStatusColor(status) {
      return status === "active"
        ? "bg-green-100 text-green-600"
        : "bg-red-100 text-red-600";
    },
    getReportStatusColor(status) {
      switch (status) {
        case "Implemented":
          return "bg-emerald-100 text-emerald-700";
        case "Reviewing":
          return "bg-amber-100 text-amber-700";
        case "Rejected":
          return "bg-red-100 text-red-700";
        default:
          return "bg-gray-100 text-gray-600";
      }
    },
    getFeedbackStatusColor(status) {
      switch (status) {
        case "Implemented":
          return "bg-emerald-100 text-emerald-700";
        case "Reviewing":
          return "bg-amber-100 text-amber-700";
        case "Rejected":
          return "bg-red-100 text-red-700";
        default:
          return "bg-blue-100 text-blue-700";
      }
    },
    getFeedbackCategoryLabel(category) {
      const map = {
        "feedback.featureRequest": "Feature Request",
        "feedback.bugReport": "Bug Report",
        "feedback.improvement": "Improvement",
        "feedback.generalFeedback": "General Feedback",
      };
      return map[category] || category;
    },
    // New methods for forum actions
    async approvePost(id) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${this.apiBase}/travelcards/${id}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "Approved" }),
          },
        );

        if (!response.ok) throw new Error("Failed to approve post");
        const post = this.forumPosts.find((p) => p.id === id);
        if (post) {
          post.status = "approved";
        }
        alert(this.t("admin.postApproved"));
      } catch (error) {
        console.error("Error approving post:", error);
      }
    },
    async rejectPost(id) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${this.apiBase}/travelcards/${id}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "Rejected" }),
          },
        );

        if (!response.ok) throw new Error("Failed to reject post");

        const post = this.forumPosts.find((p) => p.id === id);
        if (post) {
          post.status = "rejected";
        }
        alert(this.t("admin.postRejected"));
      } catch (error) {
        console.error("Error rejecting post:", error);
      }
    },
  },
};
</script>

<template>
  <div class="space-y-6 pb-10">
    <div class="bg-emerald-600 text-white rounded-2xl p-6 shadow-md">
      <div class="flex items-center gap-3 mb-1">
        <Shield class="w-6 h-6" />
        <h2 class="text-xl font-bold">{{ t("admin.adminPanel") }}</h2>
      </div>
      <p class="text-emerald-100 text-sm opacity-90"></p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="bg-white p-6 rounded-2xl border border-green-100 shadow-sm"
      >
        <p class="text-gray-500 text-sm mb-2">{{ t(stat.labelKey) }}</p>
        <p class="text-3xl font-bold text-gray-800">{{ stat.value }}</p>
      </div>
    </div>

    <div
      class="bg-white rounded-xl p-1 border border-gray-100 shadow-sm flex overflow-x-auto"
    >
      <button
        v-if="isForumAdmin"
        @click="activeTab = 'forum'"
        class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'forum'
            ? 'bg-emerald-50 text-emerald-700 font-bold'
            : 'text-gray-600 hover:bg-gray-50'
        "
      >
        <MessageCircle class="w-4 h-4" />
        {{ t("admin.forumModeration") }}
      </button>

      <button
        v-if="isGeneralAdmin"
        @click="activeTab = 'users'"
        class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'users'
            ? 'bg-emerald-50 text-emerald-700 font-bold'
            : 'text-gray-600 hover:bg-gray-50'
        "
      >
        <UserCog class="w-4 h-4" />
        {{ t("admin.userManagement") }}
      </button>

      <button
        v-if="isGeneralAdmin"
        @click="activeTab = 'feedback'"
        class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'feedback'
            ? 'bg-emerald-50 text-emerald-700 font-bold'
            : 'text-gray-600 hover:bg-gray-50'
        "
      >
        <MessageCircle class="w-4 h-4" />
        {{ t("admin.feedbackManagement") }}
      </button>

      <button
        v-if="isGeneralAdmin"
        @click="activeTab = 'reports'"
        class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'reports'
            ? 'bg-emerald-50 text-emerald-700 font-bold'
            : 'text-gray-600 hover:bg-gray-50'
        "
      >
        <Flag class="w-4 h-4" />
        {{ t("admin.userReports") }}
      </button>
    </div>

    <div
      v-if="isGeneralAdmin && activeTab === 'users'"
      class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm"
    >
      <div class="mb-6">
        <h3 class="text-emerald-700 font-medium">
          {{ t("admin.userManagementTitle") }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ t("admin.manageUserAccounts") }}
        </p>
      </div>
      <div class="space-y-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center justify-between p-4 border border-green-200 rounded-xl bg-white"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm"
            >
              {{ user.initials }}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="font-bold text-gray-900">{{ user.name }}</span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded border border-gray-100"
                  :class="getStatusColor(user.status)"
                >
                  {{ user.status }}
                </span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded border border-gray-100 bg-gray-100 text-gray-600"
                >
                  {{ t("admin.reportsCount") }}: {{ user.reports }}
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ user.email }}
                <span class="mx-1">•</span>
                {{ t("admin.joined") }} {{ user.joined }}
              </div>
            </div>
          </div>
          <button
            @click="toggleUserStatus(user)"
            class="px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors"
            :class="
              user.status === 'active'
                ? 'border-red-200 text-red-500 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            "
          >
            {{
              user.status === "active"
                ? t("admin.suspend")
                : t("admin.activate")
            }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isGeneralAdmin && activeTab === 'feedback'"
      class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm"
    >
      <div class="mb-6">
        <h3 class="text-emerald-700 font-medium">
          {{ t("admin.feedbackListTitle") }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ t("admin.reviewFeedback") }}
        </p>
      </div>

      <div v-if="isFeedbackLoading" class="text-sm text-gray-500">
        {{ t("admin.loadingFeedback") }}
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="feedback in feedbackEntries"
          :key="feedback.id"
          class="p-4 border border-green-200 rounded-xl bg-white"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-gray-500"
                  >{{ t("admin.feedbackFrom") }}:</span
                >
                <span class="text-sm font-bold text-gray-900">
                  {{ feedback.user }}
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ t("admin.feedbackCategory") }}:
                {{ getFeedbackCategoryLabel(feedback.category) }}
                <span class="mx-1">•</span>
                {{ t("admin.reportedOn") }} {{ feedback.createdAt }}
              </div>
              <div class="text-sm text-gray-800 mt-2">
                {{ feedback.subject }}
              </div>
              <div v-if="feedback.message" class="text-sm text-gray-600 mt-1">
                {{ feedback.message }}
              </div>
            </div>

            <span
              class="text-[10px] px-2 py-0.5 rounded border border-gray-100"
              :class="getFeedbackStatusColor(feedback.status)"
            >
              {{ feedback.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isGeneralAdmin && activeTab === 'reports'"
      class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm"
    >
      <div class="mb-6">
        <h3 class="text-emerald-700 font-medium">
          {{ t("admin.userReportsTitle") }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ t("admin.reviewUserReports") }}
        </p>
      </div>

      <div v-if="isReportsLoading" class="text-sm text-gray-500">
        {{ t("admin.loadingReports") }}
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="report in reportedFeedback"
          :key="report.id"
          class="p-4 border border-green-200 rounded-xl bg-white"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-gray-500"
                  >{{ t("admin.reportedUser") }}:</span
                >
                <span class="text-sm font-bold text-gray-900">
                  {{ report.reportedUserName }}
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ t("admin.reporter") }}: {{ report.reporter }}
                <span class="mx-1">•</span>
                {{ t("admin.reportedOn") }} {{ report.createdAt }}
              </div>
              <div
                v-if="report.reportedUserId"
                class="text-xs text-gray-400 mt-1"
              >
                ID: {{ report.reportedUserId }}
              </div>
            </div>

            <span
              class="text-[10px] px-2 py-0.5 rounded border border-gray-100"
              :class="getReportStatusColor(report.status)"
            >
              {{ report.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isForumAdmin && activeTab === 'forum'"
      class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm"
    >
      <div class="mb-6">
        <h3 class="text-emerald-700 font-medium">
          {{ t("admin.forumPostsModeration") }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ t("admin.reviewAndModerate") }}
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="post in forumPosts"
          :key="post.id"
          class="p-4 rounded-xl border transition-colors"
          :class="
            post.status === 'pending'
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-green-200'
          "
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold"
              >
                {{ post.initials }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-900 text-sm">{{
                    post.author
                  }}</span>
                </div>
                <p class="text-xs text-gray-500">{{ post.time }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span
                v-if="post.reports > 0"
                class="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold"
              >
                <i class="fa-solid fa-flag mr-1"></i>
                {{ post.reports }} {{ t("admin.reports") }}
              </span>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                :class="
                  post.status === 'approved'
                    ? 'bg-emerald-500 text-white'
                    : post.status === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-400 text-white'
                "
              >
                {{
                  post.status === "approved"
                    ? t("admin.approved")
                    : post.status === "rejected"
                      ? t("admin.rejected")
                      : t("admin.pending")
                }}
              </span>
            </div>
          </div>

          <p class="text-sm text-gray-800 mb-4 pl-12">
            {{ post.content }}
          </p>

          <div
            v-if="post.status === 'pending'"
            class="flex items-center gap-3 pl-12"
          >
            <button
              @click="approvePost(post.id)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Check class="w-3.5 h-3.5" />
              {{ t("admin.approve") }}
            </button>
            <button
              @click="rejectPost(post.id)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
            >
              <X class="w-3.5 h-3.5" />
              {{ t("admin.reject") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
