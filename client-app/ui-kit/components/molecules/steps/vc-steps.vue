<template>
  <ul class="vc-steps">
    <li v-for="(step, index) in steps.items">
      <component class="vc-steps__step" :is="step.to ? 'router-link' : 'span'" :to="step.to ? step.to : ''">
        <span
          class="vc-steps__number"
          :class="{
            'vc-steps__number--active': index + steps.startFrom === steps.currentStep,
            'vc-steps__number--completed': index + steps.startFrom < steps.currentStep,
          }"
        >
          <VcIcon :name="step.icon" size="xxs" v-if="step.icon" />

          <template v-else>
            {{ index + steps.startFrom }}
          </template>
        </span>

        <VcTypography
          class="vc-steps__name"
          :class="{
            'vc-steps__name--active': index + steps.startFrom === steps.currentStep,
            'vc-steps__name--completed': index + steps.startFrom < steps.currentStep,
          }"
          tag="span"
          size="medium"
        >
          {{ step.text }}
        </VcTypography>
      </component>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  steps: {
    type: Object,
    default: () => [],
  },
});
</script>

<style lang="scss">
.vc-steps {
  --vc-steps-number-color: var(--color-steps-number-color, var(--color-white));
  --vc-steps-number-color-active: var(--color-steps-number-color-active, var(--color-white));
  --vc-steps-number-color-completed: var(--color-steps-number-color-completed, var(--color-white));
  --vc-steps-number-bg: var(--color-steps-number-bg, theme("colors.gray.400"));
  --vc-steps-number-bg-active: var(--color-steps-number-bg-active, var(--color-primary));
  --vc-steps-number-bg-completed: var(--color-steps-number-bg-completed, var(--color-success));

  --vc-steps-name-color: var(--color-steps-name-color, theme("colors.gray.600"));
  --vc-steps-name-color-active: var(--color-steps-name-color-active, var(--color-body-text));
  --vc-steps-name-color-completed: var(--color-steps-name-color-completed, var(--color-success));

  @apply flex flex-wrap gap-x-5 gap-y-2.5;

  &__step {
    @apply flex items-center gap-1.5;
  }

  &__number {
    @apply flex items-center justify-center w-5 h-5 rounded-full text-sm font-extrabold
    text-[color:var(--vc-steps-number-color)]
    bg-[color:var(--vc-steps-number-bg)];

    &--active {
      @apply bg-[color:var(--vc-steps-number-bg-active)]
      text-[color:var(--vc-steps-number-color-active)];
    }

    &--completed {
      @apply bg-[color:var(--vc-steps-number-bg-completed)]
      text-[color:var(--vc-steps-number-color-completed)];
    }
  }

  &__name {
    @apply text-14 font-semibold;

    --vc-typography-color: var(--vc-steps-name-color);

    &--completed {
      --vc-typography-color: var(--vc-steps-name-color-completed);
    }

    &--active {
      @apply font-bold;

      --vc-typography-color: var(--vc-steps-name-color-active);
    }
  }
}
</style>
