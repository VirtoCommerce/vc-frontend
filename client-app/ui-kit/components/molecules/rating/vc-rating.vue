<template>
  <div :class="['vc-rating', `vc-rating--mode--${mode}`, `vc-rating--size--${size}`]">
    <span v-if="label" class="vc-rating__label">{{ label }}:</span>

    <div class="vc-rating__shapes">
      <button
        v-for="i in mode === 'mini' ? 1 : maxValue"
        :key="i"
        type="button"
        class="vc-rating__button"
        :disabled="readOnly || mode === 'mini'"
        @click="setRating(i)"
        @focus="handleMouseOver(i)"
        @blur="handleMouseOver(null)"
        @mouseover="handleMouseOver(i)"
        @mouseleave="handleMouseOver(null)"
      >
        <VcShape
          :class="[
            'vc-rating__shape',
            {
              'vc-rating__shape--filled': isShapeFilled(i),
            },
          ]"
          mask="whishlist"
        >
          <div v-if="isHalf(i)" class="vc-rating--bg" />
        </VcShape>
      </button>
    </div>

    <div v-if="withText" class="vc-rating__value">
      {{ value }}

      <span class="vc-rating__divider">/</span>

      {{ maxValue }}

      <span v-if="reviewCount" class="vc-rating__count">({{ reviewCount }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MAX_RATING } from "@/ui-kit/constants";

interface IEmits {
  (event: "setRating", value: number): void;
}

interface IProps {
  mode?: "mini" | "full";
  readOnly?: boolean;
  reviewCount?: number;
  size?: "xs" | "sm" | "md";
  value?: number;
  maxValue?: number;
  withText?: boolean;
  label?: string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: "mini",
  size: "md",
  withText: true,
  value: 0,
  maxValue: MAX_RATING,
});

const selectedRating = ref<number | null>(null);

function isHalf(index: number): boolean {
  const rating = selectedRating.value ?? props.value;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0 ? 1 : 0;
  return Boolean(index === fullStars + 1 && halfStar);
}

function isShapeFilled(index: number): boolean {
  if (props.mode === "mini") {
    return true;
  }

  const rating = selectedRating.value ?? props.value;
  const fullStars = Math.floor(rating);
  return index <= fullStars;
}

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
  @apply flex items-center gap-[--padding];

  &--size {
    &--xs {
      $sizeXS: &;

      --vc-shape-size: 0.875rem;
      --padding: 0.125rem;

      @apply text-xs;
    }

    &--sm {
      --vc-shape-size: 1rem;
      --padding: 0.188rem;

      @apply text-sm;
    }

    &--md {
      --vc-shape-size: 1.25rem;
      --padding: 0.188rem;

      @apply text-base;
    }
  }

  &--bg {
    @apply absolute inset-y-0 left-0 w-1/2 bg-primary;
  }

  &__button {
    @apply p-[--padding];
  }

  &__shape {
    --vc-shape-bg-color: theme("colors.neutral.300");

    &--filled {
      --vc-shape-bg-color: theme("colors.primary.500");
    }
  }

  &__text {
    @apply text-neutral-800;
  }

  &__value {
    @apply flex gap-px font-bold;
  }

  &__count {
    @apply ms-0.5;
  }
}
</style>
