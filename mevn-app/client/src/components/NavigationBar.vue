<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Leaf,
  Map,
  Globe,
  Calendar,
  Bell,
  Compass,
  Trophy,
  Lightbulb,
  MessageCircle,
  Shield,
  X,
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";

const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);
const user = ref(null);
const language = ref(getLanguage());

const t = computed(() => (key) => translate(key, language.value));

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

// Get user info from localStorage
onMounted(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  }
  language.value = getLanguage();
  window.addEventListener('languageChanged', handleLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener('languageChanged', handleLanguageChange);
});

// Filter nav items based on user role
const allNavItems = computed(() => [
  { routeName: "Dashboard", label: t.value('nav.dashboard'), icon: Leaf },
  { routeName: "Plan", label: t.value('nav.plan'), icon: Map },
  { routeName: "World", label: t.value('nav.world'), icon: Globe },
  { routeName: "PastTrips", label: t.value('nav.pastTrips'), icon: Calendar },
  { routeName: "Live", label: t.value('nav.live'), icon: Bell },
  { routeName: "Discover", label: t.value('nav.discover'), icon: Compass },
  { routeName: "Rewards", label: t.value('nav.rewards'), icon: Trophy },
  { routeName: "Tips", label: t.value('nav.tips'), icon: Lightbulb },
  { routeName: "Feedback", label: t.value('nav.feedback'), icon: MessageCircle },
  { routeName: "Admin", label: t.value('nav.admin'), icon: Shield, adminOnly: true },
]);

// Show Admin link only for admins
const navItems = computed(() => {
  const userRole = user.value?.role;
  if (userRole === "Admin") {
    return allNavItems.value;
  }
  return allNavItems.value.filter(item => !item.adminOnly);
});

const activeItem = computed(() => {
  return navItems.value.find((item) => item.routeName === route.name) || navItems.value[0];
});

const leftStack = computed(() => {
  return [
    navItems.value[0], // Dashboard
    navItems.value[1], // Plan
    navItems.value[2], // World
    navItems.value[3], // Past Trips
  ];
});

const rightStack = computed(() => {
  return [
    navItems.value[4], // Live
    navItems.value[5], // Discover
    navItems.value[6], // Rewards
    navItems.value[7], // Tips
  ];
});

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}
</script>

<template>
  <div class="relative z-10">
    <div
      class="hidden md:block bg-green-50 py-6 dark:bg-gray-900 dark:border-gray-700 transition-colors duration-300"
    >
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-center">
          <div
            class="w-fit bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-3 transition-colors duration-300"
          >
            <ul class="flex flex-wrap justify-center gap-2 w-full">
              <li
                v-for="item in navItems"
                :key="item.routeName"
                class="shrink-0"
              >
                <RouterLink
                  :to="{ name: item.routeName }"
                  v-slot="{ isActive, navigate }"
                  custom
                >
                  <a
                    @click="navigate"
                    :class="[
                      'flex items-center gap-2 justify-center py-2 px-4 rounded-full whitespace-nowrap cursor-pointer transition-colors',
                      isActive
                        ? 'bg-base-200 dark:bg-gray-700 text-success'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                    ]"
                  >
                    <component :is="item.icon" class="h-4 w-4" />
                    <span class="text-sm">{{ item.label }}</span>
                  </a>
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="md:hidden">
      <div
        v-if="isMenuOpen"
        @click="isMenuOpen = false"
        class="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 transition-opacity duration-300"
      ></div>

      <div
        class="fixed bottom-28 left-6 flex flex-col-reverse gap-5 z-50 transition-all duration-300 ease-out"
        :class="
          isMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-10 pointer-events-none'
        "
      >
        <RouterLink
          v-for="item in leftStack"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          v-slot="{ isActive, navigate }"
          custom
        >
          <button
            @click="
              navigate();
              isMenuOpen = false;
            "
            class="flex items-center gap-3 group"
          >
            <div
              class="w-12 h-12 rounded-full shadow-lg flex items-center justify-center border border-gray-100 bg-white text-gray-600 transition-transform active:scale-90"
              :class="{
                'bg-green-600! text-white!': isActive,
              }"
            >
              <component :is="item.icon" class="w-5 h-5" />
            </div>
            <span
              class="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {{ item.label }}
            </span>
          </button>
        </RouterLink>
      </div>

      <div
        class="fixed bottom-28 right-6 flex flex-col-reverse items-end gap-5 z-50 transition-all duration-300 ease-out"
        :class="
          isMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-10 pointer-events-none'
        "
      >
        <RouterLink
          v-for="item in rightStack"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          v-slot="{ isActive, navigate }"
          custom
        >
          <button
            @click="
              navigate();
              isMenuOpen = false;
            "
            class="flex items-center gap-3 flex-row-reverse group"
          >
            <div
              class="w-12 h-12 rounded-full shadow-lg flex items-center justify-center border border-gray-100 bg-white text-gray-600 transition-transform active:scale-90"
              :class="{
                'bg-green-600! text-white!': isActive,
              }"
            >
              <component :is="item.icon" class="w-5 h-5" />
            </div>
            <span
              class="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {{ item.label }}
            </span>
          </button>
        </RouterLink>
      </div>

      <button
        @click="toggleMenu"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-gray-800 transition-all duration-300 active:scale-95 z-50"
        :class="
          isMenuOpen
            ? 'bg-gray-900 text-white rotate-90'
            : 'bg-green-600 text-white'
        "
      >
        <X v-if="isMenuOpen" class="w-8 h-8" />
        <component v-else :is="activeItem.icon" class="w-8 h-8" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
