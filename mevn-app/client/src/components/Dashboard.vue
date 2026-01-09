<script setup>
import { ref } from "vue";
import {
  Leaf,
  Zap,
  TrendingUp,
  Car,
  Target,
  TreePine,
  Gauge,
} from "lucide-vue-next";

import CarbonTrendChart from "./charts/CarbonTrendChart.vue";
import TransportModesChart from "./charts/TransportModesChart.vue";
import DestinationChart from "./charts/DestinationChart.vue";

const stats = ref([
  {
    label: "Total CO₂ Saved",
    value: "245 kg",
    subtitle: "↑ 18% vs last month",
    icon: Leaf,
  },
  {
    label: "Green Distance",
    value: "3,842 km",
    subtitle: "✓ 950 km this month",
    icon: TrendingUp,
  },
  {
    label: "Eco Score",
    value: "892",
    subtitle: "🏆 Top 5% Traveler",
    icon: Gauge,
  },
  {
    label: "Monthly Savings Target",
    value: "65 / 100 kg",
    subtitle: "65% achieved",
    icon: Target,
  },
]);

const environmentalImpact = ref({
  trees: "11 mature trees",
  treesDesc: "Carbon absorption equivalent",
  energy: "580 kWh",
  energyDesc: "Avg. home energy saved",
  distance: "1,440 km",
  distanceDesc: "Car travel avoided",
});
</script>

<template>
  <div class="space-y-6">
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

        <div v-if="idx === 3" class="mt-2 flex flex-col gap-1">
          <progress
            class="progress progress-success w-full h-2"
            value="65"
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
          <h3 class="text-xl font-bold">Your Real World Impact</h3>
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
