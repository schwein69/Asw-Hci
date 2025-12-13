<script>
import { Leaf, Moon, Sun } from "lucide-vue-next";
import TheNavigation from "./components/NavigationBar.vue";

export default {
  name: "App",
  components: {
    Leaf,
    Moon,
    Sun,
    TheNavigation,
  },
  data() {
    return {
      isDarkMode: false,
    };
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
    class="min-h-screen bg-base-200 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300"
  >
    <header
      class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 relative z-20 transition-colors duration-300"
    >
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
        <div
          class="w-12 h-12 bg-success rounded-xl flex items-center justify-center text-success-content text-xl shadow-md"
        >
          <Leaf class="h-6 w-6" />
        </div>
        <div>
          <h1 class="text-lg font-semibold text-gray-800 dark:text-white">
            EcoVoyage
          </h1>
          <p class="text-sm text-success">Travel Green, Live Clean</p>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button
            @click="toggleDarkMode"
            class="btn btn-ghost btn-sm btn-circle text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
          >
            <Moon v-if="!isDarkMode" class="w-5 h-5" />
            <Sun v-else class="w-5 h-5" />
          </button>
          <div class="hidden sm:flex gap-2">
            <button
              class="btn btn-ghost btn-sm text-gray-700 dark:text-gray-200"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </header>

    <TheNavigation />

    <main
      class="grow md:p-8 w-full bg-green-50 dark:bg-gray-900 pb-24 md:pb-8 transition-colors duration-300"
    >
      <div class="max-w-7xl mx-auto px-4">
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
/* Global fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
