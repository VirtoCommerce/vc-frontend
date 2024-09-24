<template>
  <div class="flex items-center gap-x-1">
    <VcIcon :class="ratingIconColor" class="flex-none" name="cup" size="xs" />
    {{ rating }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Rating } from "@/core/api/graphql/types";

interface IProps {
  rating?: Rating;
}

const props = defineProps<IProps>();

const rating = computed(() => `${props.rating?.value}/5`);
const ratingIconColor = computed(() => {
  if (!props.rating) {
    return;
  }

  if (props.rating.value <= 3) {
    return "text-danger";
  }

  if (props.rating.value > 3 && props.rating.value <= 4) {
    return "text-warning";
  }

  return "text-success";
});
</script>
