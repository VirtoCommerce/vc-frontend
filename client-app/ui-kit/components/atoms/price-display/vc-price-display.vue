<template>
  <span>{{ value?.formattedAmount ?? "N/A" }}</span>
</template>

<script setup lang="ts">
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  value?: Pick<MoneyType, 'formattedAmount'>;
}

defineProps<IProps>();
</script>
