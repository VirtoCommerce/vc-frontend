<template>
  <VcRating v-if="displayRating" :rating="rating?.value">
    <template #details>({{ rating?.reviewCount }})</template>
  </VcRating>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface Props {
  rating?: {
    value: number;
    reviewCount?: number;
  };
}

const props = defineProps<Props>();

const displayRating = computed(() => props.rating?.reviewCount !== undefined && props.rating?.reviewCount > 0);
</script>
