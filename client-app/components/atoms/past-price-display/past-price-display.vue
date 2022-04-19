<template>
  <s class="text-gray-400 text-xs font-semibold">{{ value?.formattedAmount }}</s>
</template>

<script setup lang="ts">
import { MoneyType } from "@/core/api/graphql/types";
import { PropType } from "vue";

defineProps({
  value: {
    type: Object as PropType<MoneyType>,
    default: undefined,
  },
});
</script>
