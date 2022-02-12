<template>
  <div class="w-20 py-1 text-center" :class="badgeClass">{{ status }}</div>
</template>
<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  status: {
    type: String,
    default: null,
  },
});

const newStatusClass = "bg-green-500 text-white";
const processingStatusClass = "border rounded-sm border-green-500 text-green-500";
const pandingStatusCalss = "border rounded-sm border-blue-400 text-blue-400";

const badgeClass = computed(() => {
  return {
    [newStatusClass]: props.status === "New",
    [processingStatusClass]: props.status === "Processing",
    [pandingStatusCalss]: props.status === "Pending",
  };
});
</script>
