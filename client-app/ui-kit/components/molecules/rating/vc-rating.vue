<template>
  <div
    :class="[
      'vc-rating',
      `vc-rating--mode--${mode}`,
      `vc-rating--size--${size}`,
      { 'vc-rating--interactive': !isDisabledSelection },
    ]"
  >
    <span v-if="label" class="vc-rating__label">{{ label }}:</span>

    <span v-else class="sr-only">{{ currentRatingText }}</span>

    <div class="vc-rating__shapes">
      <button
        v-for="i in mode === 'mini' ? 1 : maxValue"
        :key="i"
        type="button"
        class="vc-rating__button"
        :disabled="isDisabledSelection"
        :aria-label="getButtonAriaLabel(i)"
        :tabindex="isDisabledSelection ? undefined : 0"
        @click="setRating(i)"
        @focus="handleMouseOver(i)"
        @blur="handleMouseOver(null)"
        @mouseover="handleMouseOver(i)"
        @mouseleave="handleMouseOver(null)"
      >
        <span class="vc-rating__star">
          <VcIcon class="vc-rating__shape vc-rating__shape--empty" name="star" variant="outline" />

          <span v-if="fillWidth(i) !== '0%'" class="vc-rating__star-fill" :style="{ width: fillWidth(i) }">
            <VcIcon class="vc-rating__shape vc-rating__shape--filled" name="star" variant="outline" />
          </span>
        </span>
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
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
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
  buttonAriaLabel?: (index: number) => string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: "mini",
  size: "md",
  withText: true,
  value: 0,
  maxValue: MAX_RATING,
});

const { t } = useI18n();

const selectedRating = ref<number | null>(null);

const isDisabledSelection = computed(() => props.readOnly || props.mode === "mini");

const currentRatingText = computed(() => {
  const rating = selectedRating.value ?? props.value;
  return t("ui_kit.rating.rating_label", { value: rating, maxValue: props.maxValue });
});

function fillWidth(index: number): string {
  if (props.mode === "mini") {
    return "100%";
  }

  const rating = selectedRating.value ?? props.value;
  const fraction = Math.min(Math.max(rating - (index - 1), 0), 1);

  return `${fraction * 100}%`;
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

function getButtonAriaLabel(index: number): string {
  if (props.buttonAriaLabel) {
    return props.buttonAriaLabel(index);
  }
  if (props.mode === "mini") {
    return t("ui_kit.rating.rating_label", { value: props.value, maxValue: props.maxValue });
  }
  if (props.readOnly) {
    return t("ui_kit.rating.read_only_button_aria_label", { value: index, maxValue: props.maxValue });
  }
  return t("ui_kit.rating.set_rating_aria_label", { value: index, maxValue: props.maxValue });
}
</script>

<style lang="scss">
.vc-rating {
  $interactive: "";

  @apply flex items-center gap-[--padding] text-neutral-800;

  &--interactive {
    $interactive: &;
  }

  &--size {
    &--xs {
      --star-size: 0.875rem;
      --padding: 0.125rem;

      @apply text-xs;
    }

    &--sm {
      --star-size: 1rem;
      --padding: 0.188rem;

      @apply text-sm;
    }

    &--md {
      --star-size: 1.25rem;
      --padding: 0.188rem;

      @apply text-base;
    }
  }

  &__label {
    @apply font-bold;
  }

  &__button {
    @apply p-[--padding];

    &:focus-visible {
      // primary-600 keeps >= 3:1 non-text contrast (WCAG 1.4.11) in both light and dark presets;
      // the bare `outline` class is avoided on purpose - it emits the config's default
      // outline-color (primary-100) as a dead duplicate declaration.
      @apply rounded outline-2 outline-offset-1 outline-primary-600;

      outline-style: solid;
    }

    // WCAG 2.2 AA (SC 2.5.8): operable star buttons must be at least 24x24px;
    // read-only and mini modes render disabled buttons and stay compact.
    #{$interactive} & {
      @apply inline-flex min-h-6 min-w-6 items-center justify-center;
    }
  }

  &__star {
    @apply relative block size-[--star-size];
  }

  &__star-fill {
    @apply absolute inset-y-0 start-0 overflow-hidden;
  }

  &__shape {
    --vc-icon-size: var(--star-size);

    @apply text-primary;
  }

  &__shape--filled {
    // The kit has no filled lucide star asset; the filled state reuses outline/star.svg
    // and fills the same path, so the fill always matches the outline geometry.
    :where(svg) {
      fill: currentColor;
    }
  }

  &__value {
    @apply flex gap-px ms-1 font-bold text-neutral-900;
  }

  &__divider {
    @apply mx-0.5 text-neutral-500;
  }

  &__count {
    @apply ms-1 font-normal text-neutral-500;
  }
}
</style>
