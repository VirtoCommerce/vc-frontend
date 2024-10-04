<template>
  <div class="flex items-center gap-x-1">
    <VcIcon
      :class="[
        {
          'text-danger': rating.value <= 3,
          'text-warning': rating.value > 3 && rating.value <= 4,
          'text-success': rating.value > 4,
        },
      ]"
      class="flex-none"
      name="star"
      size="xs"
    />
    {{ rating.value }}
  </div>
</template>

<script setup lang="ts">
import type { Rating } from "../api/graphql/types";

interface IProps {
  rating: Rating;
}

defineProps<IProps>();
</script>
