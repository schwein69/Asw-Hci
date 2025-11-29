<script>
import achievementsData from "../data/achievements.json";

export default {
  name: "Rewards",
  data() {
    return {
      userLevel: 1,
      ecoPoints: 0,
      progressToNextLevel: 0,
      maxPointsForLevel: 1000,
      globalRank: "Top 10%",
      achievementsUnlocked: 0,
      totalAchievements: 0,
      achievements: achievementsData.slice(0, 6), // Display first 6 achievements
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
    <!-- Hero Card -->
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
      <p class="text-sm mb-3">Progress to Planet Guardian</p>
      <div class="w-full bg-black/20 rounded-full h-2 overflow-hidden">
        <div
          class="bg-success-content h-full"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <p class="text-sm mt-2">{{ pointsToNextLevel }} points to next level</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">Achievements Unlocked</p>
        <p class="text-2xl font-bold text-gray-800">
          {{ achievementsUnlocked }} / {{ totalAchievements }}
        </p>
      </div>
      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">Total Eco Points</p>
        <p class="text-2xl font-bold text-success">{{ ecoPoints }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">Global Rank</p>
        <p class="text-2xl font-bold text-success">{{ globalRank }}</p>
      </div>
    </div>

    <!-- Achievements Section -->
    <div>
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="bg-white rounded-2xl p-4 border-2 border-success"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-start gap-3">
              <div class="text-3xl">{{ achievement.icon }}</div>
              <div>
                <h4 class="font-bold text-gray-800">{{ achievement.name }}</h4>
                <p class="text-sm text-gray-600">
                  {{ achievement.description }}
                </p>
              </div>
            </div>
            <div
              class="bg-success text-white rounded-full px-2 py-1 text-xs font-bold"
            >
              {{ achievement.points }} pts
            </div>
          </div>
          <p v-if="achievement.progress" class="text-xs text-gray-500 mb-2">
            Progress
          </p>
          <div
            v-if="achievement.progress"
            class="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
          >
            <div
              class="bg-gray-400 h-full"
              :style="{ width: achievement.progress + '%' }"
            ></div>
          </div>
          <p v-if="achievement.progress" class="text-xs text-success mt-1">
            {{ achievement.progressText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
