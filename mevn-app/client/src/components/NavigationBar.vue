<script>
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
} from "lucide-vue-next";

export default {
  name: "TheNavigation",
  components: {
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
  },
  data() {
    return {
      navItems: [
        { routeName: "Dashboard", label: "Dashboard", icon: "Leaf" },
        { routeName: "Plan", label: "Plan", icon: "Map" },
        { routeName: "World", label: "World", icon: "Globe" },
        { routeName: "PastTrips", label: "Past Trips", icon: "Calendar" },
        { routeName: "Live", label: "Live", icon: "Bell" },
        { routeName: "Discover", label: "Discover", icon: "Compass" },
        { routeName: "Rewards", label: "Rewards", icon: "Trophy" },
        { routeName: "Tips", label: "Tips", icon: "Lightbulb" },
        { routeName: "Feedback", label: "Feedback", icon: "MessageCircle" },
        { routeName: "Admin", label: "Admin", icon: "Shield" },
      ],
    };
  },
};
</script>

<template>
  <div>
    <!-- Navigation Bar Section -->
    <!-- Desktop version -->
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
    <!-- Bottom navigation (visible on small screens) -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 z-30 transition-colors duration-300"
    >
      <ul class="flex w-full overflow-x-auto no-scrollbar py-1">
        <li
          v-for="item in navItems"
          :key="item.routeName"
          class="flex-none min-w-[75px] text-center"
        >
          <RouterLink
            :to="{ name: item.routeName }"
            v-slot="{ isActive, navigate }"
            custom
          >
            <a
              @click="navigate"
              class="flex flex-col items-center justify-center w-full py-2 cursor-pointer transition-colors whitespace-nowrap"
              :class="
                isActive ? 'text-success' : 'text-gray-600 dark:text-gray-400'
              "
            >
              <div
                :class="[
                  'p-1 rounded-xl mb-1 transition-colors',
                  isActive ? 'bg-green-100 dark:bg-gray-700' : '',
                ]"
              >
                <component :is="item.icon" class="h-5 w-5" />
              </div>
              <span class="text-[10px]">{{ item.label }}</span>
            </a>
          </RouterLink>
        </li>
      </ul>
    </nav>
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
