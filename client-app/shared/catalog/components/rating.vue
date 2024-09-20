<template>
  <div class="flex items-center gap-x-1">
    <VcIcon :class="ratingIconColor" class="flex-none" name="star" size="xs" />
    {{ rating }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  rating?: number;
}

const props = defineProps<IProps>();

const rating = computed(() => `${props.rating}/5`);
const ratingIconColor = computed(() => {
  if (!props.rating) {
    return;
  }

  if (props.rating <= 3) {
    return "text-danger";
  }

  if (props.rating >= 3.1 && props.rating <= 4) {
    return "text-warning";
  }

  return "text-success";
});
</script>
