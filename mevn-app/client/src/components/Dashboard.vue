<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Leaf,
  Zap,
  TrendingUp,
  Sprout,
  Car,
  TreePine,
  Gauge,
  Footprints,
} from "lucide-vue-next";

import CarbonTrendChart from "./charts/CarbonTrendChart.vue";
import TransportModesChart from "./charts/TransportModesChart.vue";
import DestinationChart from "./charts/DestinationChart.vue";
import { getLanguage, t as translate } from "../utils/translations.js";

// --- Translation Logic ---
const language = ref(getLanguage());

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});

// Helper to translate inside script
const t = (key) => translate(key, language.value);

// --- Stats Data (Merged) ---
const stats = computed(() => [
  {
    label: t("dashboard.totalCo2Saved"),
    value: "245 kg",
    subtitle: "", // compare to average equivalent distance
    icon: Leaf,
  },
  {
    label: t("dashboard.totalDistance"), // "Total Distance"
    value: "5542 km",
    subtitle: t("dashboard.thisMonth"),
    icon: Sprout,
  },
  {
    label: t("dashboard.greenDistance"), // "Green Distance"
    value: "3842 km",
    subtitle: t("dashboard.thisMonthGreen"),
    icon: TrendingUp,
  },
  {
    label: t("dashboard.ecoScore"),
    value: "892",
    subtitle: t("dashboard.topGlobally"),
    icon: Gauge,
  },
  {
    label: t("dashboard.zeroTrips"),
    value: "14",
    subtitle: t("dashboard.zeroTripsBanner"),
    icon: Footprints,
    isZeroCount: true,
  },
]);

// --- Environmental Impact Data ---
const environmentalImpactRaw = {
  treesValue: 11,
  treesKey: "dashboard.trees",
  treesDescKey: "dashboard.treesDesc",
  energyValue: 580,
  energyKey: "dashboard.energy",
  energyDescKey: "dashboard.energyDesc",
  distanceValue: 1440,
  distanceKey: "dashboard.miles", // or distance
  distanceDescKey: "dashboard.milesDesc", // or distance desc
};

const environmentalImpact = computed(() => ({
  trees: `${environmentalImpactRaw.treesValue} ${t(
    environmentalImpactRaw.treesKey
  )}`,
  treesDesc: t(environmentalImpactRaw.treesDescKey),
  energy: `${environmentalImpactRaw.energyValue} ${t(
    environmentalImpactRaw.energyKey
  )}`,
  energyDesc: t(environmentalImpactRaw.energyDescKey),
  distance: `${environmentalImpactRaw.distanceValue} ${t(
    environmentalImpactRaw.distanceKey
  )}`,
  distanceDesc: t(environmentalImpactRaw.distanceDescKey),
}));
</script>

<template>
  <div class="space-y-6 overflow-hidden">
    <div
      class="stats stats-vertical md:stats-horizontal shadow-sm border border-green-100 bg-white w-full md:grid-cols-2 lg:grid-cols-4"
    >
      <div v-for="(stat, idx) in stats" :key="idx" class="stat">
        <div class="stat-figure text-success">
          <component :is="stat.icon" class="w-6 h-6" />
        </div>
        <div class="stat-title text-sm text-gray-600 font-medium">
          {{ stat.label }}
        </div>
        <div class="stat-value text-xl md:text-2xl text-gray-800">
          {{ stat.value }}
        </div>
        <div class="stat-desc text-xs md:text-sm text-gray-500">
          {{ stat.subtitle }}
        </div>

        <div v-if="stat.isProgressBar" class="mt-2">
          <progress
            class="progress progress-success w-full"
            value="54"
            max="100"
          ></progress>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CarbonTrendChart />
      <TransportModesChart />
    </div>

    <DestinationChart />

    <div
      class="card bg-linear-to-r from-green-600 to-green-500 text-white shadow-lg"
    >
      <div class="card-body">
        <div class="flex items-center gap-2 mb-6">
          <Leaf class="w-6 h-6" />
          <h3 class="text-xl font-bold">
            {{ t("dashboard.environmentalImpact") }}
          </h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="flex items-center gap-4 bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/10"
          >
            <div class="bg-white/20 p-3 rounded-full">
              <TreePine class="w-8 h-8 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">
                {{ environmentalImpact.trees }}
              </div>
              <div
                class="text-xs text-green-50 uppercase font-bold tracking-wide"
              >
                {{ environmentalImpact.treesDesc }}
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-4 bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/10"
          >
            <div class="bg-white/20 p-3 rounded-full">
              <Zap class="w-8 h-8 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">
                {{ environmentalImpact.energy }}
              </div>
              <div
                class="text-xs text-green-50 uppercase font-bold tracking-wide"
              >
                {{ environmentalImpact.energyDesc }}
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-4 bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/10"
          >
            <div class="bg-white/20 p-3 rounded-full">
              <Car class="w-8 h-8 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">
                {{ environmentalImpact.distance }}
              </div>
              <div
                class="text-xs text-green-50 uppercase font-bold tracking-wide"
              >
                {{ environmentalImpact.distanceDesc }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat:hover {
  background-color: #f9fafb;
}
</style>
