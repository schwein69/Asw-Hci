<script>
import {
  Leaf,
  Zap,
  TrendingUp,
  Fuel,
  Target,
  TreePine,
  Gauge,
} from "lucide-vue-next";
import CarbonTrendChart from "./charts/CarbonTrendChart.vue";
import TransportModesChart from "./charts/TransportModesChart.vue";
import DestinationChart from "./charts/DestinationChart.vue";

export default {
  name: "Dashboard",
  components: {
    Leaf,
    Zap,
    TrendingUp,
    Fuel,
    Target,
    TreePine,
    Gauge,
    CarbonTrendChart,
    TransportModesChart,
    DestinationChart,
  },
  data() {
    return {
      // Top Stats - Placeholder data
      stats: [
        {
          label: "Total CO₂ Saved",
          value: "183 kg",
          subtitle: "↑ 15% vs last month",
          icon: Leaf,
        },
        {
          label: "Green Miles",
          value: "2,847",
          subtitle: "✓ 1,200 this month",
          icon: TrendingUp,
        },
        {
          label: "Eco Score",
          value: "892",
          subtitle: "🏆 Top 10% globally",
          icon: Gauge,
        },
        {
          label: "Monthly Goal",
          value: "54 / 100 kg",
          subtitle: "Progress bar visualization",
          icon: Target,
        },
      ],
      // Environmental Impact - Placeholder
      environmentalImpact: {
        trees: "7 trees",
        treesDesc: "Equivalent to planting",
        energy: "340 kWh",
        energyDesc: "Energy saved equals",
        miles: "458 miles",
        milesDesc: "Car miles avoided",
      },
    };
  },
};
</script>

<template>
  <div class="space-y-6">
    <!-- Top Stats Cards using daisyUI stats -->
    <div
      class="stats stats-vertical md:stats-horizontal shadow-sm border border-green-100 bg-white w-full md:grid-cols-2 lg:grid-cols-4"
    >
      <div v-for="(stat, idx) in stats" :key="idx" class="stat">
        <div class="stat-figure text-success">
          <component :is="stat.icon" class="w-6 h-6" />
        </div>
        <div class="stat-title text-sm text-black">{{ stat.label }}</div>
        <div class="stat-value text-xl md:text-2xl text-black">
          {{ stat.value }}
        </div>
        <div class="stat-desc text-xs md:text-sm text-black">
          {{ stat.subtitle }}
        </div>
        <!-- Progress bar for Monthly Goal -->
        <div v-if="idx === 3" class="mt-2">
          <progress
            class="progress progress-success w-full"
            value="54"
            max="100"
          ></progress>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CarbonTrendChart />
      <TransportModesChart />
    </div>

    <!-- CO2 Saved by Destination Bar Chart -->
    <DestinationChart />

    <!-- Environmental Impact Section -->
    <div
      class="card bg-linear-to-r from-success to-success/80 text-white shadow-lg"
    >
      <div class="card-body">
        <div class="flex items-center gap-2 mb-6">
          <Leaf class="w-6 h-6" />
          <h3 class="text-xl font-bold">Your Environmental Impact</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Trees -->
          <div
            class="flex items-center gap-4 bg-white/20 p-4 rounded-lg backdrop-blur-sm"
          >
            <TreePine class="w-10 h-10 shrink-0" />
            <div>
              <div class="text-2xl font-bold">
                {{ environmentalImpact.trees }}
              </div>
              <div class="text-sm opacity-90">
                {{ environmentalImpact.treesDesc }}
              </div>
            </div>
          </div>
          <!-- Energy -->
          <div
            class="flex items-center gap-4 bg-white/20 p-4 rounded-lg backdrop-blur-sm"
          >
            <Zap class="w-10 h-10 shrink-0" />
            <div>
              <div class="text-2xl font-bold">
                {{ environmentalImpact.energy }}
              </div>
              <div class="text-sm opacity-90">
                {{ environmentalImpact.energyDesc }}
              </div>
            </div>
          </div>
          <!-- Car Miles -->
          <div
            class="flex items-center gap-4 bg-white/20 p-4 rounded-lg backdrop-blur-sm"
          >
            <Fuel class="w-10 h-10 shrink-0" />
            <div>
              <div class="text-2xl font-bold">
                {{ environmentalImpact.miles }}
              </div>
              <div class="text-sm opacity-90">
                {{ environmentalImpact.milesDesc }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
