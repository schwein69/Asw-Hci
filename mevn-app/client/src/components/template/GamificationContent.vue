<script setup>
import { computed } from "vue";
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
  Target,
  Crown,
} from "lucide-vue-next";
import { t as translate } from "../../utils/translations.js";

const props = defineProps({
  achievements: Array,
  streakDays: Number,
  streakHistory: Array,
  leaderboard: Array,
  language: String,
});

const iconMap = {
  Trophy,
  Star,
  Zap,
  Lock,
  Sprout,
  TrainFront,
  Earth,
  Heart,
  Bike,
  Target,
};

const activeStreakCount = computed(
  () => props.streakHistory.filter(Boolean).length,
);

const t = (key) => translate(key, props.language);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        {{ t("rewards.achievements") }}
      </h3>
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
                  :is="iconMap[achievement.icon] || Lock"
                  class="w-8 h-8"
                  :class="
                    achievement.locked
                      ? 'text-gray-400'
                      : achievement.color || 'text-gray-800'
                  "
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
              {{ achievement.points }} {{ t("rewards.pts") }}
            </div>
          </div>

          <div v-if="achievement.target > 0" class="mt-4">
            <div class="flex justify-between text-xs mb-1 text-gray-500">
              <span>{{ t("rewards.progress") }}</span>
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
                      100,
                    ) + '%',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <Target class="w-6 h-6 text-emerald-700" />
        <h3 class="text-lg font-bold text-emerald-800">
          {{ t("rewards.currentStreak") }}
        </h3>
      </div>
      <div class="flex flex-col md:flex-row items-center gap-6">
        <div class="flex flex-col items-center justify-center min-w-20">
          <div class="text-4xl mb-1">🔥</div>
          <div class="text-xl font-bold text-gray-800">{{ streakDays }}</div>
          <div class="text-xs text-gray-500">{{ t("rewards.days") }}</div>
        </div>
        <div class="flex-1 w-full">
          <p class="text-sm text-gray-500 mb-3">
            {{ t("rewards.keepMakingChoices") }}
          </p>
          <div class="flex gap-2 h-8 w-full">
            <div
              v-for="(active, index) in streakHistory"
              :key="index"
              class="flex-1 rounded-md"
              :class="active ? 'bg-emerald-400' : 'bg-gray-200'"
            ></div>
          </div>
          <p class="text-xs text-emerald-600 mt-2 font-medium">
            {{ t("rewards.thisWeek") }}: {{ activeStreakCount }}/7
            {{ t("rewards.daysActive") }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
      <div class="mb-4">
        <div class="flex items-center gap-2">
          <Trophy class="w-6 h-6 text-emerald-700" />
          <h3 class="text-lg font-bold text-gray-800">
            {{ t("rewards.globalLeaderboard") }}
          </h3>
        </div>
        <p class="text-sm text-gray-500">{{ t("rewards.topEcoTravelers") }}</p>
      </div>
      <div class="space-y-3">
        <div
          v-for="(user, index) in leaderboard"
          :key="user.id"
          class="flex items-center justify-between p-3 rounded-xl transition-colors border"
          :class="
            user.isMe
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-white border-transparent hover:bg-gray-50'
          "
        >
          <div class="flex items-center gap-4">
            <div class="w-8 text-center font-bold text-lg">
              <Crown
                v-if="index === 0"
                class="w-6 h-6 text-yellow-500 fill-yellow-500"
              />
            </div>
            <div
              class="font-semibold"
              :class="user.isMe ? 'text-emerald-800' : 'text-gray-700'"
            >
              {{ user.nameKey ? t(user.nameKey) : user.name }}
            </div>
          </div>
          <div
            class="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm"
            :class="user.isMe ? 'bg-emerald-500' : 'bg-emerald-600'"
          >
            {{ user.points }} {{ t("rewards.pts") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
