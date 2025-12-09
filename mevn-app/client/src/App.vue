<script>
import Dashboard from "./components/Dashboard.vue";
import MapPlan from "./components/MapPlan.vue";
import World from "./components/World.vue";
import PastTrips from "./components/PastTrips.vue";
import Live from "./components/Live.vue";
import Discover from "./components/Discover.vue";
import Rewards from "./components/Rewards.vue";
import Tips from "./components/Tips.vue";
import Feedback from "./components/Feedback.vue";
import Admin from "./components/Admin.vue";

// lucide icons
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
  name: "App",
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
    "dashboard-comp": Dashboard,
    "map-plan-comp": MapPlan,
    "world-comp": World,
    "past-trips-comp": PastTrips,
    "live-comp": Live,
    "discover-comp": Discover,
    "rewards-comp": Rewards,
    "tips-comp": Tips,
    "feedback-comp": Feedback,
    "admin-comp": Admin,
  },
  data() {
    return {
      activeComponentId: "dashboard-comp",
      navItems: [
        { id: "dashboard-comp", name: "Dashboard", icon: "Leaf" },
        { id: "map-plan-comp", name: "Plan", icon: "Map" },
        { id: "world-comp", name: "World", icon: "Globe" },
        { id: "past-trips-comp", name: "Past Trips", icon: "Calendar" },
        { id: "live-comp", name: "Live", icon: "Bell" },
        { id: "discover-comp", name: "Discover", icon: "Compass" },
        { id: "rewards-comp", name: "Rewards", icon: "Trophy" },
        { id: "tips-comp", name: "Tips", icon: "Lightbulb" },
        { id: "feedback-comp", name: "Feedback", icon: "MessageCircle" },
        { id: "admin-comp", name: "Admin", icon: "Shield" },
      ],
    };
  },
};
</script>

<template>
  <div id="app" class="min-h-screen bg-base-200 flex flex-col font-sans">
    <header class="bg-white border-b relative z-20">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
        <div
          class="w-12 h-12 bg-success rounded-xl flex items-center justify-center text-success-content text-xl shadow-md"
        >
          <Leaf class="h-6 w-6" />
        </div>
        <div>
          <h1 class="text-lg font-semibold text-gray-800">EcoVoyage</h1>
          <p class="text-sm text-success">Travel Green, Live Clean</p>
        </div>
        <div class="ml-auto hidden sm:flex items-center gap-2">
          <button class="btn btn-ghost btn-sm text-gray-700 hover:bg-gray-100">
            Profile
          </button>
          <button class="btn btn-ghost btn-sm text-gray-700 hover:bg-gray-100">
            Settings
          </button>
        </div>
      </div>
    </header>

    <!-- Navigation Bar Section -->
    <!-- Desktop version -->
    <div class="hidden md:block bg-green-50 py-6">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-center">
          <div class="w-fit bg-white rounded-3xl shadow-sm p-3">
            <ul class="flex flex-wrap justify-center gap-2 w-full">
              <li v-for="item in navItems" :key="item.id" class="shrink-0">
                <a
                  @click.prevent="activeComponentId = item.id"
                  :class="[
                    'flex items-center gap-2 justify-center py-2 px-4 rounded-full whitespace-nowrap cursor-pointer transition-colors text-sm font-medium',
                    activeComponentId === item.id
                      ? 'bg-gray-900 text-emerald-400 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  ]"
                >
                  <component :is="item.icon" class="h-4 w-4" />
                  <span>{{ item.name }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom navigation (visible on small screens) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
      <ul class="flex w-full">
        <li v-for="item in navItems" :key="item.id" class="flex-1 text-center">
          <a
            @click.prevent="activeComponentId = item.id"
            class="flex flex-col items-center justify-center w-full py-2 whitespace-nowrap"
            :class="
              activeComponentId === item.id
                ? 'bg-base-200 text-success'
                : 'text-gray-600'
            "
          >
            <component :is="item.icon" class="h-5 w-5" />
            <span class="text-xs mt-1">{{ item.name }}</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- Main Content Area with Dynamic Components -->
    <main class="grow md:p-8 w-full bg-green-50 pb-24 md:pb-8">
      <div class="max-w-7xl mx-auto px-4">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="activeComponentId"></component>
          </keep-alive>
        </transition>
      </div>
    </main>
  </div>
</template>

<style>
/* Fade transition for switching tabs */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
