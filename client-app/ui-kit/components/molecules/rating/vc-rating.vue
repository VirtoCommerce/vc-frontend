<template>
  <div
    :class="['vc-rating', `vc-rating--mode--${mode}`, `vc-rating--size--${size}`, { 'vc-rating--read-only': readOnly }]"
  >
    <template v-if="mode === 'mini'">
      <VcIcon class="vc-rating__icon" name="whishlist" :size="size" />
    </template>

    <template v-else>
      <VcShape
        v-for="i in MAX_RATING"
        :key="i"
        mask="whishlist"
        :bg-color="getColor(i)"
        @click="setRating(i)"
        @focus="handleMouseOver(i)"
        @blur="handleMouseOver(null)"
        @mouseover="handleMouseOver(i)"
        @mouseleave="handleMouseOver(null)"
      >
        <div v-if="isHalf(i)" class="vc-rating--bg" />
      </VcShape>
    </template>

    <div v-if="withText" class="vc-rating__text">
      <span class="vc-rating__current-rating">{{ value }}/5</span>
      <span v-if="reviewCount"> ({{ reviewCount }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MAX_RATING } from "@/modules/customer-reviews/constants";

interface IEmits {
  (event: "setRating", value: number): void;
}

interface IProps {
  mode?: "mini" | "full";
  readOnly?: boolean;
  reviewCount?: number;
  size?: "xs" | "sm" | "md";
  value: number;
  withText?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: "mini",
  size: "md",
  withText: true,
});

const selectedRating = ref<number | null>(null);

const getColor = (index: number): string => {
  const rating = selectedRating.value ?? props.value;
  const fullStars = Math.floor(rating);

  if (index <= fullStars) {
    return "--color-primary-500";
  }

  return "--color-neutral-300";
};

const isHalf = (index: number): boolean => {
  const rating = selectedRating.value ?? props.value;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0 ? 1 : 0;
  return Boolean(index === fullStars + 1 && halfStar);
};

function handleMouseOver(value: number | null): void {
  if (props.readOnly) {
    return;
  }
  selectedRating.value = value;
}

function setRating(value: number): void {
  if (props.readOnly) {
    return;
  }
  emit("setRating", value);
}
</script>

<style lang="scss">
.vc-rating {
  @apply flex items-center gap-0.5 cursor-pointer;

  &--size {
    &--xs {
      @apply text-xs;

      --vc-shape-size: theme("fontSize.sm");

      .vc-rating__text {
        @apply ms-1;
      }
    }

    &--sm {
      @apply text-sm;

      --vc-shape-size: theme("fontSize.base");
    }

    &--md {
      @apply text-base;

      --vc-shape-size: theme("fontSize.lg");
    }
  }

  &--mode {
    &--full {
      @apply space-x-1 text-neutral-300;

      &.vc-rating--size--md {
        @apply space-x-1.5;
      }
    }
  }

  &--bg {
    @apply absolute inset-y-0 left-0 w-1/2 bg-primary;
  }

  &__icon {
    @apply inline-block fill-primary;
  }

  &__text {
    @apply text-neutral-800 ms-1.5;
  }

  &__current-rating {
    @apply font-bold;
  }

  &--read-only {
    cursor: unset;
  }
}
</style>
