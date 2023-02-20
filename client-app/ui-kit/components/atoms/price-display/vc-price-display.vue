<template>
  <span>{{ value?.formattedAmount ?? "N/A" }}</span>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { MoneyType } from "@/xapi/types";

defineProps({
  value: {
    type: Object as PropType<MoneyType>,
    default: undefined,
  },
});
</script>
