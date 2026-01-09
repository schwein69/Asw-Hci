<script>
import { Leaf, Moon, Sun, User, LogOut } from "lucide-vue-next";
import TheNavigation from "./components/NavigationBar.vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "App",
  components: {
    Leaf,
    Moon,
    Sun,
    TheNavigation,
    User,
    LogOut,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    return { route, router };
  },
  data() {
    return {
      isDarkMode: false,
      showProfileMenu: false,
      user: null,
      profileImageUrl: null,
    };
  },
  computed: {
    isAuthPage() {
      const authRoutes = ["Login", "ForgotPassword", "ResetPassword"];
      return this.route && authRoutes.includes(this.route.name);
    },
    isAdmin() {
      return (
        this.user?.role === "GeneralAdmin" || this.user?.role === "ForumAdmin"
      );
    },
    shouldShowNavbar() {
      return !this.isAuthPage && !this.isAdmin;
    },
    shouldShowHeader() {
      return !this.isAuthPage;
    },
  },
  mounted() {
    // Load user from localStorage
    this.loadUser();

    const userPref = localStorage.theme;
    const systemPref = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (userPref === "dark" || (!userPref && systemPref)) {
      this.setDarkMode(true);
    } else {
      this.setDarkMode(false);
    }

    // Set background for auth pages
    this.updateBodyBackground();

    // Close profile menu when clicking outside
    document.addEventListener("click", this.handleClickOutside);

    // Listen for storage changes (when user logs in from another tab)
    window.addEventListener("storage", this.handleStorageChange);

    // Listen for profile image updates
    window.addEventListener("profileImageUpdated", this.loadUser);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener("storage", this.handleStorageChange);
    window.removeEventListener("profileImageUpdated", this.loadUser);
  },
  methods: {
    loadUser() {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          this.user = JSON.parse(userData);
          this.profileImageUrl = this.user?.profileImage || null;
        } catch (e) {
          console.error("Error parsing user data:", e);
          this.user = null;
          this.profileImageUrl = null;
        }
      } else {
        this.user = null;
        this.profileImageUrl = null;
      }
    },
    handleStorageChange(e) {
      if (e.key === "user") {
        this.loadUser();
      }
    },
    toggleDarkMode() {
      this.setDarkMode(!this.isDarkMode);
    },
    setDarkMode(isDark) {
      this.isDarkMode = isDark;
      const html = document.documentElement;

      if (isDark) {
        html.classList.add("dark");
        html.setAttribute("data-theme", "dark");
        localStorage.theme = "dark";
      } else {
        html.classList.remove("dark");
        html.setAttribute("data-theme", "light");
        localStorage.theme = "light";
      }
    },
    updateBodyBackground() {
      if (this.isAuthPage) {
        // Force green background even in dark mode
        document.body.style.setProperty(
          "background-color",
          "#f0fdf4",
          "important"
        );
        document.documentElement.style.setProperty(
          "background-color",
          "#f0fdf4",
          "important"
        );
        // Also set on the app div
        const appDiv = document.getElementById("app");
        if (appDiv) {
          appDiv.style.setProperty("background-color", "#f0fdf4", "important");
        }
      } else {
        document.body.style.removeProperty("background-color");
        document.documentElement.style.removeProperty("background-color");
        const appDiv = document.getElementById("app");
        if (appDiv) {
          appDiv.style.removeProperty("background-color");
        }
      }
    },
    toggleProfileMenu(e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.loadUser(); // Always reload user data
      this.showProfileMenu = !this.showProfileMenu;
      console.log("Profile menu toggled:", this.showProfileMenu);
      console.log("User data:", this.user);
    },
    handleClickOutside(event) {
      const profileButton = event.target.closest(".profile-button");
      const profileMenu = event.target.closest(".profile-menu");
      if (!profileButton && !profileMenu) {
        this.showProfileMenu = false;
      }
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.user = null;
      this.showProfileMenu = false;
      this.router.push("/login");
    },
  },
  watch: {
    $route() {
      // Reload user when route changes (in case user just logged in)
      this.loadUser();
      // Update background when route changes
      this.$nextTick(() => {
        this.updateBodyBackground();
      });
    },
    isAuthPage() {
      // Update background when auth page status changes
      this.$nextTick(() => {
        this.updateBodyBackground();
      });
    },
  },
};
</script>

<template>
  <div
    id="app"
    :class="[
      'min-h-screen flex flex-col font-sans transition-colors duration-300',
      isAuthPage
        ? 'bg-[#f0fdf4] dark:bg-[#f0fdf4]'
        : 'bg-base-200 dark:bg-gray-900',
    ]"
    :style="isAuthPage ? { backgroundColor: '#f0fdf4' } : {}"
  >
    <!-- Header - Hidden on auth pages and for admins -->
    <header
      v-if="shouldShowHeader"
      class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 relative z-30 transition-colors duration-300"
    >
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
        <div
          class="w-14 h-14 bg-success rounded-2xl flex items-center justify-center shadow-md"
        >
          <Leaf class="text-white w-8 h-8" />
        </div>
        <div>
          <h1
            class="text-xl font-semibold text-gray-900 dark:text-white tracking-tight"
          >
            EcoVoyage
          </h1>
          <p
            class="text-[9px] text-success font-light uppercase tracking-[0.2em]"
          >
            Travel Green • Live Clean
          </p>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button
            @click="toggleDarkMode"
            class="btn btn-ghost btn-sm btn-circle text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Moon v-if="!isDarkMode" class="w-5 h-5" />
            <Sun v-else class="w-5 h-5" />
          </button>

          <!-- Profile Menu -->
          <div class="relative profile-button z-50">
            <button
              @click="toggleProfileMenu"
              class="btn btn-ghost btn-sm text-gray-700 dark:text-gray-200 flex items-center gap-2 relative z-50"
            >
              <!-- Profile Image or Icon -->
              <div
                class="w-8 h-8 rounded-full overflow-hidden bg-success flex items-center justify-center shrink-0"
              >
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
                <User v-else class="w-5 h-5 text-white" />
              </div>
              <span class="hidden sm:inline">{{
                user?.username || "Profile"
              }}</span>
            </button>

            <!-- Dropdown Menu -->
            <Teleport to="body">
              <div
                v-if="showProfileMenu"
                class="profile-menu fixed w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-9999 overflow-hidden"
                :style="{ top: '80px', right: '24px' }"
              >
                <!-- User Info Section -->
                <div
                  class="p-5 bg-linear-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      class="w-12 h-12 bg-success rounded-full overflow-hidden flex items-center justify-center shrink-0"
                    >
                      <img
                        v-if="profileImageUrl"
                        :src="profileImageUrl"
                        alt="Profile"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-white font-semibold text-lg">
                        {{ user?.username?.charAt(0).toUpperCase() || "U" }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-semibold text-gray-900 dark:text-white truncate"
                      >
                        {{ user?.username || "User" }}
                      </p>
                      <p
                        class="text-xs text-gray-500 dark:text-gray-400 truncate"
                      >
                        {{ user?.email || "No email" }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Actions Section -->
                <div class="p-2 space-y-1">
                  <button
                    @click="
                      router.push('/profile');
                      showProfileMenu = false;
                    "
                    class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <User class="w-5 h-5" />
                    <span>View Profile</span>
                  </button>
                  <button
                    @click="logout"
                    class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut class="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </Teleport>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation - Hidden on auth pages and for admins -->
    <TheNavigation v-if="shouldShowNavbar" />

    <!-- Main content -->
    <main
      :class="[
        'grow w-full transition-colors duration-300',
        isAuthPage
          ? 'bg-[#f0fdf4] dark:bg-[#f0fdf4]'
          : 'md:p-8 bg-green-50 dark:bg-gray-900 pb-24 md:pb-8',
      ]"
      :style="isAuthPage ? { backgroundColor: '#f0fdf4' } : {}"
    >
      <div :class="isAuthPage ? '' : 'max-w-7xl mx-auto px-4'">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
