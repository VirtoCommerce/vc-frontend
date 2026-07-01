<template>
  <span>{{ formattedAmount }}</span>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface IProps {
  amount: number;
  cultureName: string;
  currencyCode: string;
}

const props = defineProps<IProps>();

const formattedAmount = computed(() =>
  new Intl.NumberFormat(props.cultureName, {
    currency: props.currencyCode,
    style: "currency",
  }).format(props.amount),
);
</script>
