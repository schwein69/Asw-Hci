<script>
import { TrendingUp } from "lucide-vue-next";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getLanguage, t as translate } from "../../utils/translations.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "CarbonTrendChart",
  components: { Line, TrendingUp },
  data() {
    const lang = getLanguage();
    return {
      language: lang,
      chartData: {
        labels: [
          translate("dashboard.months.jan", lang),
          translate("dashboard.months.feb", lang),
          translate("dashboard.months.mar", lang),
          translate("dashboard.months.apr", lang),
          translate("dashboard.months.may", lang),
          translate("dashboard.months.jun", lang),
        ],
        datasets: [
          {
            label: translate("dashboard.co2Emissions", lang),
            data: [120, 105, 95, 90, 75, 60],
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
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
      this.chartData.labels = [
        this.t('dashboard.months.jan'),
        this.t('dashboard.months.feb'),
        this.t('dashboard.months.mar'),
        this.t('dashboard.months.apr'),
        this.t('dashboard.months.may'),
        this.t('dashboard.months.jun'),
      ];
      this.chartData.datasets[0].label = this.t('dashboard.co2Emissions');
    },
  },
};
</script>

<template>
  <div class="card bg-white border border-green-100 shadow-sm">
    <div class="card-body">
      <div class="flex items-center gap-2 mb-4">
        <TrendingUp class="w-5 h-5 text-success" />
        <h3 class="text-lg font-bold text-gray-800">{{ t('dashboard.carbonFootprintTrend') }}</h3>
      </div>
      <div class="h-64">
        <Line :data="chartData" :options="chartOptions" class="w-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
