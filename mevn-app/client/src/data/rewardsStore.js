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
    () => achievements.value.filter((a) => !a.locked).length,
  );

  const totalAchievements = computed(() => achievements.value.length);

  function setTargetUser(userId) {
    targetUserId.value = userId;
  }

  async function fetchUserRewards() {
    isLoading.value = true;
    error.value = null;

    try {
      //TODO Simulazione chiamata API
      //TODO const res = await api.get(`/rewards/${userId}`);
      console.log("Fetching data for User ID");
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (targetUserId.value === null) {
        console.log("Fetching data for ME");
      } else {
        console.log(`Fetching data for User ID: ${targetUserId.value}`);
      }

      userStats.value = {
        userLevel: 10,
        ecoPoints: 9500,
        maxPointsForLevel: 10000,
        globalRank: "Top 1%",
        streakDays: 45,
        streakHistory: [true, true, true, true, true, true, true],
      };
      achievements.value = [
        {
          id: 1,
          name: "Green Pioneer",
          description: "First journey",
          points: 50,
          icon: "Sprout",
          locked: false,
          completed: true,
          color: "text-green-600",
        },
        {
          id: 2,
          name: "Rail Rider",
          description: "1k km train",
          points: 100,
          icon: "TrainFront",
          locked: false,
          current: 800,
          target: 1000,
          color: "text-emerald-600",
        },
        {
          id: 3,
          name: "Zero Waste",
          description: "Zero waste food",
          points: 150,
          icon: "Lock",
          locked: true,
          current: 0,
          target: 10,
        },
      ];

      leaderboard.value = [
        {
          id: 1,
          name: "Alexandra K.",
          points: 1523,
          isMe: false,
        },
        {
          id: 2,
          name: "You",
          points: userStats.value.ecoPoints,
          isMe: true,
        },
        { id: 3, name: "Yuki S.", points: 1287, isMe: false },
        {
          id: 4,
          name: "Marco P.",
          points: 950,
          isMe: false,
        },
      ];
      leaderboard.value.sort((a, b) => b.points - a.points);
    } catch (err) {
      error.value = "Impossibile caricare i rewards.";
      console.error(err);
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
