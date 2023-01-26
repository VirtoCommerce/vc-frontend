<template>
  <div class="vc-rating">
    <VcIcon class="vc-rating__icon" name="star" size="xs" />
    <div class="vc-rating__text">
      <span class="vc-rating__current-rating">{{ rating?.value }}</span>
      /5 ({{ rating?.reviewCount }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { Rating } from "@/xapi/types";

export interface Props {
  rating?: Rating;
}

defineProps<Props>();
</script>

<style lang="scss">
.vc-rating {
  @apply flex flex-row items-center gap-0.5;

  &__icon {
    @apply text-primary;
  }

  &__text {
    @apply text-13 text-gray-800 font-semibold;
  }

  &__current-rating {
    @apply font-extrabold;
  }
}
</style>
