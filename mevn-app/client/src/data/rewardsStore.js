import { defineStore } from "pinia";
import { ref, computed } from "vue";
const defaultUserStats = {
  userLevel: 1,
  ecoPoints: 0,
  maxPointsForLevel: 1000,
  globalRank: "...",
  streakDays: 0,
  streakHistory: [], // Important: Always an empty array, never undefined
};
export const useRewardsStore = defineStore("rewards", () => {
  const isLoading = ref(false);
  const error = ref(null);

  // Dati Utente
  const targetUserId = ref(null);
  const userStats = ref({ ...defaultUserStats });
  // Liste Dati
  const achievements = ref([]);
  const leaderboard = ref([]);

  const achievementsUnlocked = computed(
    () => achievements.value.filter((a) => !a.locked).length
  );

  const totalAchievements = computed(() => achievements.value.length);

  function setTargetUser(userId) {
    targetUserId.value = userId;
  }

  async function fetchUserRewards() {
    isLoading.value = true;
    error.value = null;

    try {
      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = targetUserId.value || user?._id || user?.id;

      if (!userId) {
        throw new Error("User not logged in");
      }

      console.log(`Fetching rewards for user: ${userId}`);

      // Call the complete rewards endpoint (gets everything in one call)
      const response = await fetch(
        `http://localhost:3000/api/achievements/${userId}/complete`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch rewards");
      }

      const {
        userStats: stats,
        achievements: rawAchievements,
        leaderboard: rawLeaderboard,
      } = result.data;

      // Map user stats
      userStats.value = {
        userLevel: stats.userLevel,
        ecoPoints: stats.ecoPoints,
        maxPointsForLevel: stats.maxPointsForLevel,
        globalRank: stats.globalRank,
        streakDays: stats.streakDays,
        streakHistory: stats.streakHistory || [],
      };

      // Map achievements to frontend format
      achievements.value = rawAchievements.map((achievement) => {
        const def = achievement.definition;
        const nextTier = achievement.nextTier;
        const isCompleted = achievement.completed;

        return {
          id: achievement._id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          color: def.color,
          locked: achievement.currentTier === 0,
          completed: isCompleted,
          points: achievement.totalPointsEarned,
          current: achievement.currentProgress,
          target: nextTier?.target || achievement.currentProgress,
          // Add tier info for display
          currentTier: achievement.currentTier,
          tierName:
            achievement.tierHistory[achievement.tierHistory.length - 1]
              ?.tierName || "Bronze",
          nextTierName: nextTier?.name,
          nextTierPoints: nextTier?.points,
        };
      });

      // Map leaderboard
      leaderboard.value = rawLeaderboard.map((entry) => ({
        id: entry.id,
        name: entry.name,
        points: entry.points,
        isMe: entry.isMe,
        rank: entry.rank,
      }));

      console.log("Rewards data loaded successfully");
      console.log(`  - Level: ${userStats.value.userLevel}`);
      console.log(`  - Points: ${userStats.value.ecoPoints}`);
      console.log(`  - Achievements: ${achievements.value.length}`);
      console.log(
        `  - Unlocked: ${achievementsUnlocked.value}/${totalAchievements.value}`
      );
    } catch (err) {
      error.value = "Failed to load rewards data.";
      console.error("Error fetching rewards:", err);

      // Reset to defaults on error
      userStats.value = { ...defaultUserStats };
      achievements.value = [];
      leaderboard.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  function resetTarget() {
    targetUserId.value = null;
    userStats.value = { ...defaultUserStats };
    achievements.value = [];
    leaderboard.value = [];
  }

  return {
    setTargetUser,
    resetTarget,
    isLoading,
    userStats,
    achievements,
    leaderboard,
    achievementsUnlocked,
    totalAchievements,
    fetchUserRewards,
  };
});
