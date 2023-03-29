<template>
  <div v-if="$cfg.rating_enabled && rating && (reviewCount === undefined || reviewCount > 0)">
    <VcLabel v-if="label">{{ label }}</VcLabel>
    <div class="vc-rating">
      <template v-if="variant == 'stars'">
        <VcIcon v-for="index in rating" :key="index" class="vc-rating__icon" name="star" size="xs" />
        <template v-if="rating > 0">
          <VcIcon
            v-for="index in max - rating"
            :key="index"
            class="vc-rating__icon vc-rating__icon--disabled"
            name="star"
            size="xs"
          />
        </template>
      </template>
      <template v-else>
        <VcIcon v-if="variant == 'star-and-text'" class="vc-rating__icon" name="star" size="xs" />
        <div class="vc-rating__text">
          <span class="vc-rating__current-rating">{{ rating }}</span
          >/{{ max }}
          <template v-if="reviewCount">({{ reviewCount }})</template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label?: string;
  rating?: number;
  reviewCount?: number;
  max?: number;
  variant?: "stars" | "star-and-text" | "text";
}

withDefaults(defineProps<IProps>(), {
  max: 5,
  variant: "star-and-text",
  withReviewCount: false,
});
</script>

<style lang="scss">
.vc-rating {
  @apply flex items-center gap-0.5 whitespace-nowrap;

  &__icon {
    @apply text-[color:var(--color-rating)];

    &--disabled {
      @apply text-[color:var(--color-rating-disabled)];
    }
  }

  &__text {
    @apply text-13 text-gray-800 font-semibold;
  }

  &__current-rating {
    @apply font-extrabold;
  }
}
</style>
