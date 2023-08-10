<template>
  <span>{{ formattedAmount }}</span>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },

  cultureName: {
    type: String,
    required: true,
  },

  currencyCode: {
    type: String,
    required: true,
  },
});

const formattedAmount = computed(() =>
  new Intl.NumberFormat(props.cultureName, {
    currency: props.currencyCode,
    style: "currency",
  }).format(props.amount),
);
</script>
