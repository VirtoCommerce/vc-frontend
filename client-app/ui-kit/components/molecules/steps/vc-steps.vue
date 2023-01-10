<template>
  <ul class="vc-steps">
    <li v-for="(step, index) in steps" :key="index">
      <component class="vc-steps__step" :is="step.to ? 'router-link' : 'span'" :to="step.to ? step.to : ''">
        <span
          class="vc-steps__number"
          :class="{
            'vc-steps__number--active': index + startFrom === currentStep,
            'vc-steps__number--completed': index + startFrom < currentStep,
          }"
        >
          <VcIcon :name="step.icon" size="xxs" v-if="step.icon" />

          <template v-else>
            {{ index + startFrom }}
          </template>
        </span>

        <VcTypography
          class="vc-steps__name"
          :class="{
            'vc-steps__name--active': index + startFrom === currentStep,
            'vc-steps__name--completed': index + startFrom < currentStep,
          }"
          tag="span"
          size="medium"
          weight="semibold"
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
  startFrom: {
    type: Number,
    default: 0,
  },
  currentStep: {
    type: Number,
    default: 0,
  },
  steps: {
    type: Array as PropType<any[]>,
    required: true,
  },
});
</script>

<style lang="scss">
.vc-steps {
  @apply flex flex-wrap gap-x-5 gap-y-2.5;

  &__step {
    @apply flex items-center gap-1.5;
  }

  &__number {
    @apply shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-sm font-extrabold
    text-[color:var(--color-white)]
    bg-gray-400;

    --vc-icon-color: var(--color-white);

    &--active {
      @apply bg-[color:var(--color-primary)];
    }

    &--completed {
      @apply bg-[color:var(--color-success)];
    }
  }

  &__name {
    --vc-typography-color: theme("colors.gray.600");

    &--completed {
      --vc-typography-color: var(--color-success);
    }

    &--active {
      --vc-typography-color: var(--color-body-text);
    }
  }
}
</style>
