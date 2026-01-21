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

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});

// Helper to translate inside script
const t = (key) => translate(key, language.value);

const statsData = ref({
  totalCo2SavedKg: 0,
  totalDistanceKm: 0,
  greenDistanceKm: 0,
  ecoScore: 0,
  zeroTrips: 0,
});

const formatNumber = (value) => {
  return Number.isFinite(value) ? value.toLocaleString() : "0";
};

const fetchDashboardSummary = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("http://localhost:3000/api/dashboard/summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard summary");
    }

    const data = await response.json();
    statsData.value = {
      totalCo2SavedKg: data.totalCo2SavedKg || 0,
      totalDistanceKm: data.totalDistanceKm || 0,
      greenDistanceKm: data.greenDistanceKm || 0,
      ecoScore: data.ecoScore || 0,
      zeroTrips: data.zeroTrips || 0,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
  }
};

const fetchEnvironmentalImpact = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("http://localhost:3000/api/dashboard/impact", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch environmental impact");
    }

    const data = await response.json();
    environmentalImpactRaw.value = {
      ...environmentalImpactRaw.value,
      treesValue: data.trees || 0,
      energyValue: data.energyKwh || 0,
      distanceValue: data.miles || 0,
    };
  } catch (error) {
    console.error("Failed to fetch environmental impact:", error);
  }
};

onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
  fetchDashboardSummary();
  fetchEnvironmentalImpact();
});

// --- Stats Data (Merged) ---
const stats = computed(() => [
  {
    label: t("dashboard.totalCo2Saved"),
    value: `${formatNumber(statsData.value.totalCo2SavedKg)} kg`,
    subtitle: "", // compare to average equivalent distance
    icon: Leaf,
  },
  {
    label: t("dashboard.totalDistance"), // "Total Distance"
    value: `${formatNumber(statsData.value.totalDistanceKm)} km`,
    subtitle: t("dashboard.thisMonth"),
    icon: Sprout,
  },
  {
    label: t("dashboard.greenDistance"), // "Green Distance"
    value: `${formatNumber(statsData.value.greenDistanceKm)} km`,
    subtitle: t("dashboard.thisMonthGreen"),
    icon: TrendingUp,
  },
  {
    label: t("dashboard.ecoScore"),
    value: `${formatNumber(statsData.value.ecoScore)}`,
    subtitle: t("dashboard.topGlobally"),
    icon: Gauge,
  },
  {
    label: t("dashboard.zeroTrips"),
    value: `${formatNumber(statsData.value.zeroTrips)}`,
    subtitle: t("dashboard.zeroTripsBanner"),
    icon: Footprints,
    isZeroCount: true,
  },
]);

const environmentalImpactRaw = ref({
  treesValue: 0,
  treesKey: "dashboard.trees",
  treesDescKey: "dashboard.treesDesc",
  energyValue: 0,
  energyKey: "dashboard.energy",
  energyDescKey: "dashboard.energyDesc",
  distanceValue: 0,
  distanceKey: "dashboard.miles",
  distanceDescKey: "dashboard.milesDesc",
});

const environmentalImpact = computed(() => ({
  trees: `${environmentalImpactRaw.value.treesValue} ${t(
    environmentalImpactRaw.value.treesKey
  )}`,
  treesDesc: t(environmentalImpactRaw.value.treesDescKey),
  energy: `${environmentalImpactRaw.value.energyValue} ${t(
    environmentalImpactRaw.value.energyKey
  )}`,
  energyDesc: t(environmentalImpactRaw.value.energyDescKey),
  distance: `${environmentalImpactRaw.value.distanceValue} ${t(
    environmentalImpactRaw.value.distanceKey
  )}`,
  distanceDesc: t(environmentalImpactRaw.value.distanceDescKey),
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
