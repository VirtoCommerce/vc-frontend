<template>
  <div v-if="$cfg.rating_enabled && rating && (reviewCount === undefined || reviewCount > 0)">
    <VcLabel v-if="label" class="vc-rating-info__label">{{ label }}</VcLabel>
    <div class="vc-rating-info">
      <VcIcon class="vc-rating-info__icon" name="star" size="xs" />
      <div class="vc-rating-info__text">
        <span class="vc-rating-info__current-rating">{{ rating }}</span
        >/{{ max }}
        <template v-if="reviewCount">({{ reviewCount }})</template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcLabel, VcIcon } from "@/ui-kit/components/atoms";

interface IProps {
  label?: string;
  rating: number | null | undefined;
  reviewCount?: number;
  max?: number;
}

withDefaults(defineProps<IProps>(), {
  max: 5,
});
</script>

<style lang="scss">
.vc-rating-info {
  @apply flex items-center gap-0.5 whitespace-nowrap;

  &__label {
    @apply mb-1;
  }

  &__icon {
    @apply text-[color:var(--color-rating)];
  }

  &__text {
    @apply text-13 text-gray-800 font-semibold;
  }

  &__current-rating {
    @apply font-extrabold;
  }
}
</style>
