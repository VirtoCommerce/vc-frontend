<template>
  <div v-if="displayRating">
    <div v-if="label" class="font-bold">{{ label }}</div>
    <VcRating :rating="rating?.value">
      <template #details>({{ rating?.reviewCount }})</template>
    </VcRating>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface Props {
  label?: string;
  rating?: {
    value: number;
    reviewCount?: number;
  };
}

const props = defineProps<Props>();

const displayRating = computed(() => props.rating?.reviewCount !== undefined && props.rating?.reviewCount > 0);
</script>
