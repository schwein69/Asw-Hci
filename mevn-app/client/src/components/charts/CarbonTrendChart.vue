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
    return {
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "CO₂ Emissions (kg)",
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
};
</script>

<template>
  <div class="card bg-white border border-green-100 shadow-sm">
    <div class="card-body">
      <div class="flex items-center gap-2 mb-4">
        <TrendingUp class="w-5 h-5 text-success" />
        <h3 class="text-lg font-bold text-gray-800">Carbon Footprint Trend</h3>
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
