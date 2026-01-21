<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { PolarArea } from "vue-chartjs";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getLanguage, t as translate } from "../../utils/translations.js";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const language = ref(getLanguage());

const t = (key) => translate(key, language.value);

const modeValues = ref([0, 0, 0, 0, 0, 0]);

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
      data: modeValues.value,
      backgroundColor: [
        "rgba(59, 130, 246, 0.7)",
        "rgba(139, 92, 246, 0.7)",
        "rgba(16, 185, 129, 0.7)",
        "rgba(132, 204, 22, 0.7)",
        "rgba(249, 115, 22, 0.7)",
        "rgba(239, 68, 68, 0.7)",
      ],
      borderColor: "#ffffff",
      borderWidth: 2,
      hoverOffset: 4,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 10,
  },
  scales: {
    r: {
      ticks: {
        backdropColor: "transparent",
        color: "#9ca3af",
        font: { size: 10 },
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
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
          return ` ${context.label}: ${context.parsed.r}%`;
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

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

const fetchTransportModes = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      modeValues.value = [0, 0, 0, 0, 0, 0];
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/dashboard/transport-modes",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transport modes");
    }

    const data = await response.json();
    if (Array.isArray(data.values) && data.values.length === 6) {
      modeValues.value = data.values;
    } else {
      modeValues.value = [0, 0, 0, 0, 0, 0];
    }
  } catch (error) {
    console.error("Failed to fetch transport modes:", error);
    modeValues.value = [0, 0, 0, 0, 0, 0];
  }
};

onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
  fetchTransportModes();
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

      <div class="grow relative min-h-[250px] flex justify-center items-center">
        <PolarArea :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
