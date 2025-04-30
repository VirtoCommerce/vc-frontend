<template>
  <div>
    <canvas id="priceChart"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from "chart.js";
import { ref, onMounted } from "vue";

Chart.register(...registerables);

const chartData = ref({
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Price Change",
      backgroundColor: "#42A5F5",
      borderColor: "#1E88E5",
      data: [65, 59, 80, 81, 56, 55, 40],
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Price Change Over Time",
    },
  },
});

onMounted(() => {
  const ctx = document.getElementById("priceChart") as HTMLCanvasElement;
  new Chart(ctx, {
    type: "line",
    data: chartData.value,
    options: chartOptions.value,
  });
});
</script>

<style scoped lang="scss">
#priceChart {
  max-width: 600px;
  margin: 0 auto;
}
</style>
