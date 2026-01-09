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
import { getLanguage, t as translate } from "../utils/translations.js";

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
      language: getLanguage(),
      stats: [
        {
          labelKey: "dashboard.totalCo2Saved",
          value: "183 kg",
          subtitleKey: "dashboard.vsLastMonth",
          icon: Leaf,
        },
        {
          labelKey: "dashboard.greenMiles",
          value: "2,847",
          subtitleKey: "dashboard.thisMonth",
          icon: TrendingUp,
        },
        {
          labelKey: "dashboard.ecoScore",
          value: "892",
          subtitleKey: "dashboard.topGlobally",
          icon: Gauge,
        },
        {
          labelKey: "dashboard.monthlyGoal",
          value: "54 / 100 kg",
          subtitleKey: "dashboard.progressBar",
          icon: Target,
        },
      ],
      environmentalImpact: {
        treesValue: 7,
        treesKey: "dashboard.trees",
        treesDescKey: "dashboard.treesDesc",
        energyValue: 340,
        energyKey: "dashboard.energy",
        energyDescKey: "dashboard.energyDesc",
        milesValue: 458,
        milesKey: "dashboard.miles",
        milesDescKey: "dashboard.milesDesc",
      },
    };
  },
  computed: {
    t() {
      return (key) => translate(key, this.language);
    },
    statsWithTranslations() {
      return this.stats.map(stat => ({
        ...stat,
        label: this.t(stat.labelKey),
        subtitle: this.t(stat.subtitleKey)
      }));
    },
    environmentalImpactWithTranslations() {
      return {
        ...this.environmentalImpact,
        trees: `${this.environmentalImpact.treesValue} ${this.t(this.environmentalImpact.treesKey)}`,
        treesDesc: this.t(this.environmentalImpact.treesDescKey),
        energy: `${this.environmentalImpact.energyValue} ${this.t(this.environmentalImpact.energyKey)}`,
        energyDesc: this.t(this.environmentalImpact.energyDescKey),
        miles: `${this.environmentalImpact.milesValue} ${this.t(this.environmentalImpact.milesKey)}`,
        milesDesc: this.t(this.environmentalImpact.milesDescKey)
      };
    }
  },
  mounted() {
    window.addEventListener('languageChanged', this.handleLanguageChange);
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this.handleLanguageChange);
  },
  methods: {
    handleLanguageChange(event) {
      this.language = event.detail.language;
    },
  },
};
</script>

<template>
  <div class="space-y-6">
    <div
      class="stats stats-vertical md:stats-horizontal shadow-sm border border-green-100 bg-white w-full md:grid-cols-2 lg:grid-cols-4"
    >
      <div v-for="(stat, idx) in statsWithTranslations" :key="idx" class="stat">
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
          <h3 class="text-xl font-bold">{{ t('dashboard.environmentalImpact') }}</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Trees -->
          <div
            class="flex items-center gap-4 bg-white/20 p-4 rounded-lg backdrop-blur-sm"
          >
            <TreePine class="w-10 h-10 shrink-0" />
            <div>
              <div class="text-2xl font-bold">
                {{ environmentalImpactWithTranslations.trees }}
              </div>
              <div class="text-sm opacity-90">
                {{ environmentalImpactWithTranslations.treesDesc }}
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
                {{ environmentalImpactWithTranslations.energy }}
              </div>
              <div class="text-sm opacity-90">
                {{ environmentalImpactWithTranslations.energyDesc }}
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
                {{ environmentalImpactWithTranslations.miles }}
              </div>
              <div class="text-sm opacity-90">
                {{ environmentalImpactWithTranslations.milesDesc }}
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
