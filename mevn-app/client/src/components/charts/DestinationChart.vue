<script>
import { TreePine } from "lucide-vue-next";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getLanguage, t as translate } from "../../utils/translations.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "DestinationChart",
  components: { Bar, TreePine },
  data() {
    const lang = getLanguage();
    return {
      language: lang,
      chartData: {
        labels: ["Amsterdam", "Barcelona", "Copenhagen", "Dublin"],
        datasets: [
          {
            label: translate("dashboard.co2Saved", lang),
            data: [45, 38, 52, 28],
            backgroundColor: ["#10b981", "#10b981", "#10b981", "#10b981"],
            borderColor: "#059669",
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: "x",
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#4b5563",
              font: { size: 12 },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
          x: {
            ticks: { color: "#9ca3af" },
            grid: { display: false },
          },
        },
      },
    };
  },
  computed: {
    t() {
      return (key) => translate(key, this.language);
    },
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
      this.updateChartData();
    },
    updateChartData() {
      this.chartData.datasets[0].label = this.t('dashboard.co2Saved');
    },
  },
};
</script>

<template>
  <div class="card bg-white border border-green-100 shadow-sm">
    <div class="card-body">
      <div class="flex items-center gap-2 mb-4">
        <TreePine class="w-5 h-5 text-success" />
        <h3 class="text-lg font-bold text-gray-800">
          {{ t('dashboard.co2SavedByDestination') }}
        </h3>
      </div>
      <div class="h-64">
        <Bar :data="chartData" :options="chartOptions" class="w-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
