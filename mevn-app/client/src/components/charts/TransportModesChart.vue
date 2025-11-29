<script>
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  name: "TransportModesChart",
  components: { Pie },
  data() {
    return {
      chartData: {
        labels: ["Train", "Bus", "Bike", "Walk", "Car"],
        datasets: [
          {
            data: [35, 28, 20, 12, 5],
            backgroundColor: [
              "#10b981",
              "#06b6d4",
              "#14b8a6",
              "#34d399",
              "#f59e0b",
            ],
            borderColor: "#fff",
            borderWidth: 3,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + " " + context.parsed + "%";
              },
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 10,
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
            cornerRadius: 4,
          },
          legend: {
            display: true,
            position: "right",
            labels: {
              color: "#4b5563",
              font: { size: 11 },
              padding: 10,
              usePointStyle: true,
            },
          },
        },
      },
    };
  },
};
</script>

<template>
  <div class="card bg-white border border-green-100 shadow-sm">
    <div class="card-body">
      <h3 class="text-xl font-bold text-success mb-1">Transport Modes</h3>
      <p class="text-sm text-gray-600 mb-4">Your eco-friendly choices</p>
      <div class="h-56 flex justify-center items-center">
        <Pie :data="chartData" :options="chartOptions" class="w-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
