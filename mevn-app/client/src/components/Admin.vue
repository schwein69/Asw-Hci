<script>
import {
  Shield,
  MessageCircle,
  UserCog,
  Settings,
  Save,
  Check,
  X,
  Trash2,
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";

export default {
  name: "Admin",
  components: {
    Shield,
    MessageCircle,
    UserCog,
    Settings,
    Save,
    Check,
    X,
    Trash2,
  },
  data() {
    return {
      language: getLanguage(),
      // Stats Data
      stats: [
        { labelKey: "admin.totalUsers", value: "1247" },
        { labelKey: "admin.activeItineraries", value: "542" },
        { labelKey: "admin.forumPosts", value: "3891" },
        { labelKey: "admin.avgEcoScore", value: "87" },
      ],

      // Tab State
      activeTab: "forum", // Set to 'forum' to see changes immediately

      // Settings Data
      platformName: "EcoVoyage",
      ecoScoreThreshold: 70,
      weatherSensitivity: 3,
      maintenanceMessage: "",

      // User Management Data
      users: [
        {
          id: 1,
          name: "Sarah Mitchell",
          email: "sarah@example.com",
          joined: "2024-01-15",
          role: "user",
          status: "active",
          initials: "SM",
        },
        {
          id: 2,
          name: "Michael Chen",
          email: "michael@example.com",
          joined: "2024-02-20",
          role: "admin",
          status: "active",
          initials: "MC",
        },
        {
          id: 3,
          name: "Emma Johnson",
          email: "emma@example.com",
          joined: "2024-03-10",
          role: "user",
          status: "active",
          initials: "EJ",
        },
        {
          id: 4,
          name: "David Brown",
          email: "david@example.com",
          joined: "2024-01-05",
          role: "user",
          status: "suspended",
          initials: "DB",
        },
      ],

      // --- NEW: Forum Moderation Data ---
      forumPosts: [
        {
          id: 1,
          author: "Sarah M.",
          initials: "SA",
          time: "2h ago",
          content:
            "Best eco-friendly hotels in Copenhagen? Looking for sustainable options with good transport links.",
          status: "approved",
          reports: 0,
        },
        {
          id: 2,
          author: "John D.",
          initials: "JO",
          time: "5h ago",
          content: "This platform is amazing! Saved 50kg CO2 on my last trip.",
          status: "approved",
          reports: 0,
        },
        {
          id: 3,
          author: "Anonymous",
          initials: "AN",
          time: "1h ago",
          content: "Check out this spam link...",
          status: "pending", // Pending review
          reports: 3,
        },
      ],
    };
  },
  computed: {
    t() {
      return (key) => translate(key, this.language);
    },
  },
  mounted() {
    this.language = getLanguage();
    window.addEventListener('languageChanged', this.handleLanguageChange);
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this.handleLanguageChange);
  },
  methods: {
    handleLanguageChange(event) {
      this.language = event.detail.language;
    },
    saveSettings() {
      alert(this.t('admin.systemSettingsSaved'));
    },
    toggleUserStatus(user) {
      user.status = user.status === "active" ? "suspended" : "active";
    },
    getRoleColor(role) {
      return role === "admin" || role === "AdminGeneral" || role === "AdminForum"
        ? "bg-blue-100 text-blue-600"
        : "bg-gray-100 text-gray-600";
    },
    getStatusColor(status) {
      return status === "active"
        ? "bg-green-100 text-green-600"
        : "bg-red-100 text-red-600";
    },
    // New methods for forum actions
    approvePost(id) {
      const post = this.forumPosts.find((p) => p.id === id);
      if (post) {
        post.status = "approved";
        post.reports = 0;
        alert(this.t('admin.postApproved'));
      }
    },
    rejectPost(id) {
      this.forumPosts = this.forumPosts.filter((p) => p.id !== id);
      alert(this.t('admin.postRejected'));
    },
    deletePost(id) {
      this.forumPosts = this.forumPosts.filter((p) => p.id !== id);
      alert(this.t('admin.postDeleted'));
    },
  },
};
</script>

<template>
  <div class="space-y-6 pb-10">
    <div class="bg-emerald-600 text-white rounded-2xl p-6 shadow-md">
      <div class="flex items-center gap-3 mb-1">
        <Shield class="w-6 h-6" />
        <h2 class="text-xl font-bold">{{ t('admin.adminPanel') }}</h2>
      </div>
      <p class="text-emerald-100 text-sm opacity-90">
        {{ t('admin.generalAdministratorAccess') }}
      </p>
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
        @click="activeTab = 'forum'"
        class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'forum'
            ? 'bg-emerald-50 text-emerald-700 font-bold'
            : 'text-gray-600 hover:bg-gray-50'
        "
        >
          <MessageCircle class="w-4 h-4" />
          {{ t('admin.forumModeration') }}
        </button>

        <button
          @click="activeTab = 'users'"
          class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
          :class="
            activeTab === 'users'
              ? 'bg-emerald-50 text-emerald-700 font-bold'
              : 'text-gray-600 hover:bg-gray-50'
          "
        >
          <UserCog class="w-4 h-4" />
          {{ t('admin.userManagement') }}
        </button>

        <button
          @click="activeTab = 'settings'"
          class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
          :class="
            activeTab === 'settings'
              ? 'bg-emerald-50 text-emerald-700 font-bold'
              : 'text-gray-600 hover:bg-gray-50'
          "
        >
          <Settings class="w-4 h-4" />
          {{ t('admin.systemSettings') }}
        </button>
    </div>

    <div
      v-if="activeTab === 'settings'"
      class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm"
    >
      <div class="mb-6">
        <h3 class="text-emerald-700 font-medium">{{ t('admin.systemSettingsTitle') }}</h3>
        <p class="text-sm text-gray-500">{{ t('admin.configurePlatformParameters') }}</p>
      </div>
      <form @submit.prevent="saveSettings" class="space-y-4">
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-800 ml-1"
            >{{ t('admin.platformName') }}</label
          >
          <input
            v-model="platformName"
            type="text"
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-800 ml-1"
            >{{ t('admin.defaultEcoScoreThreshold') }}</label
          >
          <input
            v-model="ecoScoreThreshold"
            type="number"
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-800 ml-1"
            >{{ t('admin.weatherAlertSensitivity') }}</label
          >
          <input
            v-model="weatherSensitivity"
            type="number"
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-800 ml-1"
            >{{ t('admin.maintenanceMessage') }}</label
          >
          <input
            v-model="maintenanceMessage"
            type="text"
            :placeholder="t('admin.maintenanceMessagePlaceholder')"
            class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          class="bg-emerald-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm mt-2"
        >
          {{ t('admin.saveSettings') }}
        </button>
      </form>
    </div>

    <div
      v-if="activeTab === 'users'"
      class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm"
    >
      <div class="mb-6">
        <h3 class="text-emerald-700 font-medium">{{ t('admin.userManagementTitle') }}</h3>
        <p class="text-sm text-gray-500">
          {{ t('admin.manageUserAccounts') }}
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
                  :class="getRoleColor(user.role)"
                >
                  {{ user.role }}
                </span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded border border-gray-100"
                  :class="getStatusColor(user.status)"
                >
                  {{ user.status }}
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ user.email }}
                <span class="mx-1">•</span>
                {{ t('admin.joined') }} {{ user.joined }}
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
            {{ user.status === "active" ? t('admin.suspend') : t('admin.activate') }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="activeTab === 'forum'"
      class="bg-white p-6 rounded-2xl border border-green-200 shadow-sm"
    >
      <div class="mb-6">
        <h3 class="text-emerald-700 font-medium">{{ t('admin.forumPostsModeration') }}</h3>
        <p class="text-sm text-gray-500">
          {{ t('admin.reviewAndModerate') }}
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
                {{ post.reports }} {{ t('admin.reports') }}
              </span>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                :class="
                  post.status === 'approved'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-400 text-white'
                "
              >
                {{ post.status === 'approved' ? t('admin.approved') : t('admin.pending') }}
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
              {{ t('admin.approve') }}
            </button>
            <button
              @click="rejectPost(post.id)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
            >
              <X class="w-3.5 h-3.5" />
              {{ t('admin.reject') }}
            </button>
            <button
              @click="deletePost(post.id)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-red-500 text-xs font-medium hover:text-red-700 transition-colors ml-auto"
            >
              <Trash2 class="w-3.5 h-3.5" />
              {{ t('admin.delete') }}
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
