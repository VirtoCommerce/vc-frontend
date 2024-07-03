<template>
  <div class="vc-rating">
    <VcIcon class="vc-rating__icon" name="star" size="xs" />
    <div class="vc-rating__text">
      <span class="vc-rating__current-rating">{{ rating.value }}</span>
      /5 ({{ rating.reviewCount }})
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Rating } from "@/core/api/graphql/types";

interface IProps {
  rating: Rating;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-rating {
  @apply flex items-center gap-0.5;

  &__icon {
    @apply text-primary;
  }

  &__text {
    @apply text-sm text-gray-800 font-bold;
  }

  &__current-rating {
    @apply font-black;
  }
}
</style>
