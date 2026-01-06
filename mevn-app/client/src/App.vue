<script>
import { Leaf, Moon, Sun } from "lucide-vue-next";
import TheNavigation from "./components/NavigationBar.vue";
import { useRoute } from "vue-router";

export default {
  name: "App",
  components: {
    Leaf,
    Moon,
    Sun,
    TheNavigation,
  },
  setup() {
    const route = useRoute();
    return { route };
  },
  data() {
    return {
      isDarkMode: false,
    };
  },
  computed: {
    isAuthPage() {
      const authRoutes = ['Login', 'ResetPassword'];
      return this.route && authRoutes.includes(this.route.name);
    },
  },
  mounted() {
    const userPref = localStorage.theme;
    const systemPref = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (userPref === "dark" || (!userPref && systemPref)) {
      this.setDarkMode(true);
    } else {
      this.setDarkMode(false);
    }
  },
  methods: {
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
  },
};
</script>

<template>
  <div
    id="app"
    :class="[
      'min-h-screen flex flex-col font-sans transition-colors duration-300',
      isAuthPage ? 'bg-[#f0fdf4] dark:bg-gray-900' : 'bg-base-200 dark:bg-gray-900'
    ]"
  >
    <!-- Header - Hidden on auth pages -->
    <header
      v-if="!isAuthPage"
      class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 relative z-20 transition-colors duration-300"
    >
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
        <div
          class="w-14 h-14 bg-success rounded-2xl flex items-center justify-center shadow-md"
        >
          <Leaf class="text-white w-8 h-8" />
        </div>
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
            EcoVoyage
          </h1>
          <p class="text-[9px] text-success font-light uppercase tracking-[0.2em]">
            Travel Green • Live Clean
          </p>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button
            @click="toggleDarkMode"
            class="btn btn-ghost btn-sm btn-circle text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
          >
            <Moon v-if="!isDarkMode" class="w-5 h-5" />
            <Sun v-else class="w-5 h-5" />
          </button>
          <div>
            <button
              class="btn btn-ghost btn-sm text-gray-700 dark:text-gray-200"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation - Hidden on auth pages -->
    <TheNavigation v-if="!isAuthPage" />

    <!-- Main content -->
    <main
      :class="[
        'grow w-full transition-colors duration-300',
        isAuthPage 
          ? 'bg-[#f0fdf4] dark:bg-gray-900' 
          : 'md:p-8 bg-green-50 dark:bg-gray-900 pb-24 md:pb-8'
      ]"
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
