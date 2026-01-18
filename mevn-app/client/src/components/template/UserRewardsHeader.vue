<script setup>
import { computed } from "vue";
import { Trophy, Star, Zap } from "lucide-vue-next";
import { t as translate } from "../../utils/translations.js";

const props = defineProps({
  userLevel: Number,
  ecoPoints: Number,
  maxPoints: Number,
  globalRank: String,
  achievementsUnlocked: Number,
  totalAchievements: Number,
  language: String,
});

const progressPercentage = computed(
  () => (props.ecoPoints / props.maxPoints) * 100,
);
const pointsToNextLevel = computed(() => props.maxPoints - props.ecoPoints);

const t = (key) => translate(key, props.language);
</script>

<template>
  <div class="space-y-6">
    <div class="bg-success text-success-content rounded-2xl p-6 shadow-md">
      <div class="flex items-center gap-3 mb-4">
        <div class="text-3xl">👑</div>
        <div>
          <h2 class="text-2xl font-bold">
            {{ t("rewards.sustainabilityHero") }}
          </h2>
          <p class="text-sm opacity-90">
            {{ t("rewards.level") }} {{ userLevel }}
          </p>
        </div>
        <div class="ml-auto text-right">
          <div class="text-3xl font-bold">{{ ecoPoints }}</div>
          <p class="text-sm opacity-90">{{ t("rewards.ecoPoints") }}</p>
        </div>
      </div>

      <div class="flex justify-between items-end mb-2">
        <p class="text-sm">{{ t("rewards.progressToPlanetGuardian") }}</p>
        <p class="text-sm font-medium opacity-90">
          {{ ecoPoints }} / {{ maxPoints }}
        </p>
      </div>

      <div class="w-full bg-black/20 rounded-full h-2 overflow-hidden">
        <div
          class="bg-success-content h-full"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <p class="text-sm mt-2">
        {{ pointsToNextLevel }} {{ t("rewards.pointsToNextLevel") }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">
          {{ t("rewards.achievementsUnlocked") }}
        </p>
        <div class="flex items-center gap-2">
          <Trophy class="w-6 h-6 text-yellow-500" />
          <p class="text-2xl font-bold text-gray-800">
            {{ achievementsUnlocked }} / {{ totalAchievements }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">
          {{ t("rewards.totalEcoPoints") }}
        </p>
        <div class="flex items-center gap-2">
          <Star class="w-6 h-6 text-green-500 fill-current" />
          <p class="text-2xl font-bold text-success">{{ ecoPoints }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-green-200">
        <p class="text-gray-500 text-sm mb-1">{{ t("rewards.globalRank") }}</p>
        <div class="flex items-center gap-2">
          <Zap class="w-6 h-6 text-green-500 fill-current" />
          <p class="text-2xl font-bold text-success">{{ globalRank }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
