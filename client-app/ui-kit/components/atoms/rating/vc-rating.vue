<template>
  <div class="vc-rating">
    <template v-if="variant == 'stars'">
      <i v-for="index in rating" :key="index" class="fas fa-star vc-rating__icon vc-rating__icon--active" />
      <template v-if="rating > 0">
        <i v-for="index in max - rating" :key="index" class="fas fa-star vc-rating__icon vc-rating__icon--disabled" />
      </template>
    </template>
    <template v-else>
      <i v-if="variant == 'star-and-text'" class="fas fa-star vc-rating__icon vc-rating__icon--active" />
      <span class="font-extrabold">{{ rating }}</span
      >/{{ max }}
      <slot name="details"></slot>
    </template>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  rating: number;
  max?: number;
  variant?: "stars" | "star-and-text" | "text";
}

withDefaults(defineProps<Props>(), {
  max: 5,
  variant: "star-and-text",
});
</script>

<style lang="scss">
.vc-rating {
  @apply font-bold whitespace-nowrap;

  &__icon {
    font-size: inherit;
    @apply mr-0.5;

    &--active {
      @apply text-[color:var(--color-rating-active)];
    }

    &--disabled {
      @apply text-[color:var(--color-rating-disabled)];
    }
  }
}
</style>
