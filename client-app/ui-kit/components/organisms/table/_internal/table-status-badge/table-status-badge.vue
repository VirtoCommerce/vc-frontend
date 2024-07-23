<template>
  <div class="w-20 rounded-sm py-1 text-center text-xs" :class="badgeClass">{{ status }}</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  status: {
    type: String,
    default: null,
  },
});

const newStatusClass = "bg-success text-additional-50";
const processingStatusClass = "border border-success text-success";
const pandingStatusCalss = "border border-info-400 text-info-400";

const badgeClass = computed(() => {
  return {
    [newStatusClass]: props.status === "New",
    [processingStatusClass]: props.status === "Processing",
    [pandingStatusCalss]: props.status === "Pending",
  };
});
</script>
