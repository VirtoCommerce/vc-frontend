<template>
  <div>
    <canvas id="priceChart"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from "chart.js";
import { ref, onMounted, defineProps } from "vue";

const props = defineProps({
  currency: {
    type: String,
    default: "$",
  },

  priceData: {
    type: Array as () => { price: number; date: string }[],
    required: true,
  },

  chartColor: {
    type: String,
    default: "#42A5F5",
  },
});

Chart.register(...registerables);

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const labels = props.priceData.map((item) => new Date(item.date).toLocaleDateString());
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const data = props.priceData.map((item) => item.price);

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const chartData = ref({
  labels: labels,
  datasets: [
    {
      backgroundColor: props.chartColor,
      borderColor: props.chartColor,
      data: data,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
});

const minPrice = Math.min(...data);
const maxPrice = Math.max(...data);

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Price Change Over Time",
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      min: Math.round(minPrice * 0.8),
      max: Math.round(maxPrice * 1.2),
      ticks: {
        callback: function (tickValue: string | number) {
          return props.currency + tickValue;
        },
      },
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
  max-width: 800px;
  height: 250px;
  margin: 0 auto;
}
</style>
