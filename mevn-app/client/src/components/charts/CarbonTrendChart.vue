<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { TrendingUp, Calendar } from "lucide-vue-next";
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
  Filler,
} from "chart.js";
import { getLanguage, t as translate } from "../../utils/translations.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const language = ref(getLanguage());
const currentYear = new Date().getFullYear();
const availableYears = ref([currentYear, currentYear - 1, currentYear - 2]);
const selectedYear = ref(String(currentYear));
const monthlyEmissions = ref(Array.from({ length: 12 }, () => 0));

const allMonthLabels = computed(() => [
  translate("dashboard.months.jan", language.value),
  translate("dashboard.months.feb", language.value),
  translate("dashboard.months.mar", language.value),
  translate("dashboard.months.apr", language.value),
  translate("dashboard.months.may", language.value),
  translate("dashboard.months.jun", language.value),
  translate("dashboard.months.jul", language.value),
  translate("dashboard.months.aug", language.value),
  translate("dashboard.months.sep", language.value),
  translate("dashboard.months.oct", language.value),
  translate("dashboard.months.nov", language.value),
  translate("dashboard.months.dec", language.value),
]);

const chartData = computed(() => ({
  labels: allMonthLabels.value,
  datasets: [
    {
      label: `${translate("dashboard.co2Emissions", language.value)} (${
        selectedYear.value
      })`,
      data: monthlyEmissions.value,
      borderColor: "#10b981",
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
        gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#10b981",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      spanGaps: false,
    },
  ],
}));

const t = (key) => translate(key, language.value);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: { color: "#4b5563", font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      titleColor: "#1f2937",
      bodyColor: "#10b981",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        label: (context) => `${context.parsed.y} kg CO₂`,
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
};

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

const fetchMonthlyEmissions = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      monthlyEmissions.value = Array.from({ length: 12 }, () => 0);
      return;
    }

    const response = await fetch(
      `http://localhost:3000/api/dashboard/emissions?year=${selectedYear.value}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch monthly emissions");
    }

    const data = await response.json();
    monthlyEmissions.value =
      Array.isArray(data.months) && data.months.length === 12
        ? data.months
        : Array.from({ length: 12 }, () => 0);
  } catch (error) {
    console.error("Failed to fetch monthly emissions:", error);
    monthlyEmissions.value = Array.from({ length: 12 }, () => 0);
  }
};

onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
  fetchMonthlyEmissions();
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});

watch(selectedYear, () => {
  fetchMonthlyEmissions();
});
</script>

<template>
  <div class="card bg-white border border-green-100 shadow-sm h-full">
    <div class="card-body p-5">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
      >
        <div class="flex items-center gap-2">
          <div class="p-2 bg-green-50 rounded-lg">
            <TrendingUp class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 leading-none">
              {{ t("dashboard.carbonFootprintTrend") }}
            </h3>
            <span class="text-xs text-gray-400">{{
              t("dashboard.monthlyOverview")
            }}</span>
          </div>
        </div>

        <div
          class="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200"
        >
          <div class="relative">
            <Calendar
              class="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <select
              v-model="selectedYear"
              class="select select-xs select-ghost pl-8 font-medium text-gray-600 focus:bg-white w-24 focus:outline-none cursor-pointer"
            >
              <option
              v-for="year in availableYears"
                :key="year"
                :value="year"
              >
                {{ year }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="h-64 w-full relative">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
