<template>
  <span>{{ value?.formattedAmount ?? "N/A" }}</span>
</template>

<script setup lang="ts">
import type { MoneyType } from "@/xapi/types";

interface IProps {
  value: MoneyType;
}

defineProps<IProps>();
</script>
