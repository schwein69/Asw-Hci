<script>
// Import icons from lucide
import {
  Trophy,
  Star,
  Zap,
  Lock,
  Sprout,
  TrainFront,
  Earth,
  Heart,
  Bike,
  Share2,
  Shield,
} from "lucide-vue-next";

export default {
  name: "Rewards",
  components: {
    Trophy,
    Star,
    Zap,
    Lock,
    Sprout,
    TrainFront,
    Earth,
    Heart,
    Bike,
    Share2,
    Shield,
  },
  data() {
    return {
      userLevel: 1,
      ecoPoints: 0,
      progressToNextLevel: 0,
      maxPointsForLevel: 1000,
      globalRank: "Top 10%",
      achievementsUnlocked: 4,
      totalAchievements: 8,
      // UPDATED: Added 'color' property to unlocked items to match the screenshot
      achievements: [
        {
          id: 1,
          name: "Green Pioneer",
          description: "Complete your first carbon-neutral journey",
          points: 50,
          icon: "Sprout",
          locked: false,
          completed: true,
          color: "text-green-600",
        },
        {
          id: 2,
          name: "Rail Rider",
          description: "Travel 1,000 km by train",
          points: 100,
          icon: "TrainFront",
          locked: false,
          current: 1247,
          target: 1000,
          color: "text-emerald-600",
        },
        {
          id: 3,
          name: "Zero Waste Warrior",
          description: "Visit 10 zero-waste restaurants",
          points: 150,
          icon: "Lock",
          locked: true,
          current: 7,
          target: 10,
        },
        {
          id: 4,
          name: "Eco Explorer",
          description: "Visit 5 different countries sustainably",
          points: 200,
          icon: "Earth",
          locked: false,
          completed: true,
          color: "text-emerald-600",
        },
        {
          id: 5,
          name: "Carbon Saver",
          description: "Save 100 kg of CO2",
          points: 250,
          icon: "Heart",
          locked: false,
          current: 163,
          target: 100,
          color: "text-green-500", // Added Color
        },
        {
          id: 6,
          name: "Bike Champion",
          description: "Travel 500 km by bike",
          points: 300,
          icon: "Lock",
          locked: true,
          current: 342,
          target: 500,
        },
        {
          id: 7,
          name: "Eco Influencer",
          description: "Share 20 sustainable recommendations",
          points: 350,
          icon: "Lock",
          locked: true,
          current: 12,
          target: 20,
        },
        {
          id: 8,
          name: "Planet Protector",
          description: "Achieve a 90+ eco score for a month",
          points: 500,
          icon: "Lock",
          locked: true,
          current: 0,
          target: 0,
        },
      ],
    };
  },
  computed: {
    progressPercentage() {
      return (this.progressToNextLevel / this.maxPointsForLevel) * 100;
    },
    pointsToNextLevel() {
      return this.maxPointsForLevel - this.progressToNextLevel;
    },
  },
};
</script>

<template>
  <div class="space-y-6">
    <div class="bg-success text-success-content rounded-2xl p-6 shadow-md">
      <div class="flex items-center gap-3 mb-4">
        <div class="text-3xl">👑</div>
        <div>
          <h2 class="text-2xl font-bold">Sustainability Hero</h2>
          <p class="text-sm opacity-90">Level {{ userLevel }}</p>
        </div>
        <div class="ml-auto text-right">
          <div class="text-3xl font-bold">{{ ecoPoints }}</div>
          <p class="text-sm opacity-90">Eco Points</p>
        </div>
      </div>

      <div class="flex justify-between items-end mb-2">
        <p class="text-sm">Progress to Planet Guardian</p>
        <p class="text-sm font-medium opacity-90">
          {{ ecoPoints }} / {{ maxPointsForLevel }}
        </p>
      </div>

      <div class="w-full bg-black/20 rounded-full h-2 overflow-hidden">
        <div
          class="bg-success-content h-full"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <p class="text-sm mt-2">{{ pointsToNextLevel }} points to next level</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">Achievements Unlocked</p>
        <div class="flex items-center gap-2">
          <Trophy class="w-6 h-6 text-yellow-500" />
          <p class="text-2xl font-bold text-gray-800">
            {{ achievementsUnlocked }} / {{ totalAchievements }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">Total Eco Points</p>
        <div class="flex items-center gap-2">
          <Star class="w-6 h-6 text-green-500 fill-current" />
          <p class="text-2xl font-bold text-success">{{ ecoPoints }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">Global Rank</p>
        <div class="flex items-center gap-2">
          <Zap class="w-6 h-6 text-green-500 fill-current" />
          <p class="text-2xl font-bold text-success">{{ globalRank }}</p>
        </div>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="bg-white rounded-2xl p-4 border-2"
          :class="
            achievement.locked ? 'border-gray-200 bg-gray-50' : 'border-success'
          "
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-start gap-3">
              <div class="text-3xl">
                <component
                  :is="achievement.icon"
                  :class="
                    achievement.locked
                      ? 'text-gray-400'
                      : achievement.color || 'text-gray-800'
                  "
                  class="w-8 h-8"
                  :fill="
                    achievement.icon === 'Heart' && !achievement.locked
                      ? 'currentColor'
                      : 'none'
                  "
                />
              </div>
              <div>
                <h4 class="font-bold text-gray-800">{{ achievement.name }}</h4>
                <p class="text-xs text-gray-600">
                  {{ achievement.description }}
                </p>
              </div>
            </div>
            <div
              class="rounded-full px-2 py-1 text-xs font-bold"
              :class="
                achievement.locked
                  ? 'bg-gray-300 text-gray-600'
                  : 'bg-success text-white'
              "
            >
              {{ achievement.points }} pts
            </div>
          </div>

          <div v-if="achievement.target > 0" class="mt-4">
            <div class="flex justify-between text-xs mb-1 text-gray-500">
              <span>Progress</span>
              <span>{{ achievement.current }} / {{ achievement.target }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="h-full"
                :class="achievement.locked ? 'bg-gray-800' : 'bg-black'"
                :style="{
                  width:
                    Math.min(
                      (achievement.current / achievement.target) * 100,
                      100
                    ) + '%',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
