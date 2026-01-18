<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getLanguage } from "../utils/translations.js";
import UserRewardsHeader from "./template/UserRewardsHeader.vue";
import GamificationContent from "./template/GamificationContent.vue";

// Stato della lingua
const language = ref(getLanguage());

// Dati Utente (Header)
const userLevel = ref(1);
const ecoPoints = ref(0);
const maxPointsForLevel = ref(1000);
const globalRank = ref("Top 10%");

// Dati Achievements
const achievements = ref([
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
    color: "text-green-500",
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
]);

// Dati Streak
const streakDays = ref(14);
const streakHistory = ref([true, true, true, true, true, true, true]);

// Dati Leaderboard
const leaderboard = ref([
  { rank: 1, name: "Alexandra K.", points: 1523, icon: "👑", isMe: false },
  { rank: 2, name: "Marcus T.", points: 1401, icon: "🥈", isMe: false },
  { rank: 3, name: "Yuki S.", points: 1287, icon: "🥉", isMe: false },
  { rank: 4, nameKey: "rewards.you", points: 892, icon: "⭐", isMe: true },
  { rank: 5, name: "Emma W.", points: 845, icon: "#5", isMe: false },
]);

// Computed
const achievementsUnlocked = computed(
  () => achievements.value.filter((a) => !a.locked).length,
);
const totalAchievements = computed(() => achievements.value.length);

// Gestione Lingua
const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});
</script>

<template>
  <div class="space-y-6 pb-10">
    <UserRewardsHeader
      :userLevel="userLevel"
      :ecoPoints="ecoPoints"
      :maxPoints="maxPointsForLevel"
      :globalRank="globalRank"
      :achievementsUnlocked="achievementsUnlocked"
      :totalAchievements="totalAchievements"
      :language="language"
    />

    <GamificationContent
      :achievements="achievements"
      :streakDays="streakDays"
      :streakHistory="streakHistory"
      :leaderboard="leaderboard"
      :language="language"
    />
  </div>
</template>
