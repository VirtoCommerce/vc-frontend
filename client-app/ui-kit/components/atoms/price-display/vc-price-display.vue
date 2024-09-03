<template>
  <span>{{ value?.amount ? prefix : "" }}{{ value?.formattedAmount ?? $t("common.labels.not_available") }}</span>
</template>

<script setup lang="ts">
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  prefix?: string;
  value?: MoneyType;
}

defineProps<IProps>();
</script>
