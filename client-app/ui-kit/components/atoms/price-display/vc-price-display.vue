<template>
  <span>{{ value?.formattedAmount ?? "N/A" }}</span>
</template>

<script setup lang="ts">
import { MoneyType } from "@/xapi/types";
import { PropType } from "vue";

defineProps({
  value: {
    type: Object as PropType<MoneyType>,
    default: undefined,
  },
});
</script>
