<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getLanguage, t as translate } from "../../utils/translations.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// --- STATE ---
const language = ref(getLanguage());

// --- TRANSLATION HELPER ---
const t = (key) => translate(key, language.value);

// --- CHART DATA (Reactive) ---
// Using computed ensures labels are re-translated when language changes
const chartData = computed(() => ({
  labels: [
    translate("dashboard.transportTypes.train", language.value),
    translate("dashboard.transportTypes.bus", language.value),
    translate("dashboard.transportTypes.bike", language.value),
    translate("dashboard.transportTypes.walk", language.value),
    translate("dashboard.transportTypes.car", language.value),
    translate("dashboard.transportTypes.airplane", language.value),
  ],
  datasets: [
    {
      data: [30, 25, 20, 10, 10, 5],
      backgroundColor: [
        "#3b82f6", // Train: Blue
        "#8b5cf6", // Bus: Purple
        "#10b981", // Bike: Emerald
        "#84cc16", // Walk: Lime
        "#f97316", // Car: Orange (High Carbon)
        "#ef4444", // Airplane: Red (Highest Carbon)
      ],
      hoverBackgroundColor: [
        "#2563eb",
        "#7c3aed",
        "#059669",
        "#65a30d",
        "#ea580c",
        "#dc2626",
      ],
      borderColor: "#ffffff",
      borderWidth: 2,
      hoverOffset: 4,
    },
  ],
}));

// --- CHART OPTIONS ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 10,
  },
  plugins: {
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#1f2937",
      bodyColor: "#1f2937",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      boxPadding: 4,
      callbacks: {
        label: function (context) {
          return ` ${context.label}: ${context.parsed}%`;
        },
      },
    },
    legend: {
      display: true,
      position: "right",
      labels: {
        color: "#4b5563",
        font: {
          size: 11,
          family: "'Inter', sans-serif",
          weight: 500,
        },
        padding: 12,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
  },
};

// --- EVENT HANDLING ---
const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});
</script>

<template>
  <div class="card bg-white border border-green-100 shadow-sm h-full">
    <div class="card-body p-5 flex flex-col h-full">
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-1">
          {{ t("dashboard.transportModes") }}
        </h3>
      </div>

      <div class="grow relative min-h-[200px] flex justify-center items-center">
        <Pie :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
