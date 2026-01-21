<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { History, Loader2 } from "lucide-vue-next";
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

// --- STATE ---
const isLoading = ref(true);
const processedTrips = ref([]);
const language = ref(getLanguage());

// --- TRANSLATION HELPER ---
const t = (key) => translate(key, language.value);

const fetchTripEfficiency = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      processedTrips.value = [];
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/dashboard/trip-efficiency",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch trip efficiency");
    }

    const data = await response.json();
    processedTrips.value = Array.isArray(data.trips) ? data.trips : [];
  } catch (error) {
    console.error("Failed to fetch trip efficiency:", error);
    processedTrips.value = [];
  }
};

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

onMounted(async () => {
  window.addEventListener("languageChanged", handleLanguageChange);
  await fetchTripEfficiency();
  isLoading.value = false;
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});

// --- CHART CONFIGURATION ---
const chartData = computed(() => ({
  labels: processedTrips.value.map((t) => t.name),
  datasets: [
    {
      label: t("dashboard.myTrip"), // Translatable label
      data: processedTrips.value.map((t) => t.myTotal),
      backgroundColor: "#10b981", // Green
      borderRadius: 4,
      barPercentage: 0.6,
      categoryPercentage: 0.8,
    },
    {
      label: t("dashboard.averageTrip"), // Translatable label
      data: processedTrips.value.map((t) => t.avgTotal),
      backgroundColor: "#d1d5db", // Gray
      borderRadius: 4,
      barPercentage: 0.6,
      categoryPercentage: 0.8,
    },
  ],
}));

// Changed from const to computed so axis titles update when language changes
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      align: "end",
      labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        afterBody: (tooltipItems) => {
          const index = tooltipItems[0].dataIndex;
          const trip = processedTrips.value[index];
          // Example translation for Route prefix
          return `${t("dashboard.route")}: ${trip.routeSummary}`;
        },
        label: (context) => ` ${context.dataset.label}: ${context.raw} kg CO₂`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: t("dashboard.totalCo2") }, // Translatable axis title
      grid: { color: "#f3f4f6" },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
  },
}));
</script>

<template>
  <div
    class="card bg-white border border-green-100 shadow-sm h-full flex flex-col"
  >
    <div class="card-body p-5 flex-none">
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-green-50 rounded-lg">
            <History class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">
              {{ t("dashboard.tripEfficiency") }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ t("dashboard.tripEfficiencyDesc") }}
            </p>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="flex items-center gap-2 text-xs text-gray-400"
        >
          <Loader2 class="w-3 h-3 animate-spin" />
          {{ t("dashboard.calculating") }}
        </div>
      </div>
    </div>

    <div class="grow overflow-x-auto pb-4 px-5 custom-scrollbar">
      <div
        v-if="isLoading"
        class="h-64 flex justify-center items-center text-gray-400 text-sm"
      >
        {{ t("dashboard.aggregatingData") }}
      </div>

      <div
        v-else
        class="h-64"
        :style="{ minWidth: `${Math.max(400, processedTrips.length * 100)}px` }"
      >
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <div
      class="p-3 text-[10px] text-gray-400 text-center border-t border-gray-50"
    >
      {{ t("dashboard.tripComparisonDisclaimer") }}
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 99px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
