<template>
  <div class="vc-slider">
    <Bar :options="chartOptions" :data="chartData" />

    <VueSlider v-model="value" />
  </div>
</template>

<script setup lang="ts">
import { Chart as ChartJS, Tooltip, BarElement, CategoryScale, LinearScale } from "chart.js";
import { computed, ref } from "vue";
import VueSlider from "vue-3-slider-component";
import { Bar } from "vue-chartjs";

const value = ref([20, 40]);
ChartJS.register(Tooltip, BarElement, CategoryScale, LinearScale);

const chartData = computed(() => ({
  labels: ["", "", "", ""],
  datasets: [{ data: [40, 20, 62, 5] }],
}));

const chartOptions = computed(() => ({
  responsive: true,
  scales: {
    beginAtZero: true,
    x: {
      border: {
        display: false,
      },
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
    y: {
      border: {
        display: false,
      },
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
  },
  onClick: handleClick,
}));

function handleClick(e: Event) {
  console.log("handleClick", e);
}
</script>

<style lang="scss">
.vc-slider {
  @apply w-48;
}
</style>
