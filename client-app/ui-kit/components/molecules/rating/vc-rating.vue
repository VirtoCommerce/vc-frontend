<template>
  <div class="vc-rating" :class="{ 'space-x-1.5 text-nowrap text-neutral-300': mode === 'full' }">
    <template v-if="mode === 'mini'">
      <VcIcon class="vc-rating__icon vc-rating__icon--filled" name="star" :size="size" />
    </template>
    <template v-else>
      <VcShape
        v-for="i in MAX_RATING"
        :key="i"
        :class="{ 'cursor-pointer': !readOnly }"
        icon="whishlist"
        mask="whishlist"
        :size="`${size}px`"
        :icon-color="getColor(i)"
        :bg-color="getColor(i)"
        @click="setRating(i)"
        @focus="handleMouseOver(i)"
        @blur="handleMouseOver(null)"
        @mouseover="handleMouseOver(i)"
        @mouseleave="handleMouseOver(null)"
      >
        <div v-if="isHalf(i)" class="absolute inset-y-0 left-0 w-1/2 bg-primary"></div>
      </VcShape>
    </template>
    <div
      v-if="viewValue"
      class="vc-rating__text"
      :style="{ fontSize: `${size}px`, marginLeft: size === 14 ? '4px' : '6px' }"
    >
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
  size?: VcIconSizeType;
  value: number;
  viewValue?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: "mini",
  readOnly: true,
  size: 14,
  viewValue: true,
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
  @apply flex items-center gap-0.5;

  &__icon {
    @apply inline-block;
    &--filled {
      @apply fill-primary;
    }
  }

  &__text {
    @apply text-neutral-800;
  }

  &__current-rating {
    @apply font-bold;
  }
}
</style>
