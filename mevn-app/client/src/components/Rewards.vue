<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { getLanguage } from "../utils/translations.js";
import UserRewardsHeader from "./template/UserRewardsHeader.vue";
import GamificationContent from "./template/GamificationContent.vue";
import { useRewardsStore } from "../data/rewardsStore";
import { storeToRefs } from "pinia";
// Stato della lingua
const language = ref(getLanguage());
const rewardsStore = useRewardsStore();
// Estraggo lo stato in modo reattivo
const {
  userStats,
  achievements,
  leaderboard,
  isLoading,
  achievementsUnlocked,
  totalAchievements,
} = storeToRefs(rewardsStore);
// Gestione Lingua
const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
  rewardsStore.fetchUserRewards();
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
  rewardsStore.resetTarget();
});
</script>

<template>
  <div class="space-y-6 pb-10">
    <div v-if="isLoading" class="flex justify-center p-10">
      <span class="loading loading-spinner loading-lg text-success"></span>
    </div>
    <div v-else class="space-y-6">
      <UserRewardsHeader
        :userLevel="userStats.userLevel"
        :ecoPoints="userStats.ecoPoints"
        :maxPoints="userStats.maxPointsForLevel"
        :globalRank="userStats.globalRank"
        :achievementsUnlocked="achievementsUnlocked"
        :totalAchievements="totalAchievements"
        :language="language"
      />

      <GamificationContent
        :achievements="achievements"
        :streakDays="userStats.streakDays"
        :streakHistory="userStats.streakHistory"
        :leaderboard="leaderboard"
        :language="language"
      />
    </div>
  </div>
</template>
