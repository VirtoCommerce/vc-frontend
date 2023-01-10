<template>
  <ul class="vc-steps">
    <li
      v-for="(step, index) in steps"
      :key="index"
      :class="[
        'vc-steps__item',
        {
          'vc-steps__item--active': index + startStep === currentStep,
          'vc-steps__item--completed': index + startStep < currentStep,
        },
      ]"
    >
      <component
        :is="step.route && index + startStep < currentStep ? 'router-link' : 'span'"
        :to="step.route"
        class="vc-steps__step"
      >
        <span class="vc-steps__icon">
          <!-- Custom icon -->
          <VcIcon v-if="step.icon" :name="step.icon" size="xxs" />

          <!-- Completed icon -->
          <VcIcon v-else-if="index + startStep < currentStep" name="apply" size="xxs" />

          <!-- Step number -->
          <template v-else>{{ index + startStep }}</template>
        </span>

        <span class="vc-steps__text">{{ step.text }}</span>
      </component>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  startStep: {
    type: Number,
    default: 1,
  },

  currentStep: {
    type: Number,
    default: -1,
    required: true,
  },

  steps: {
    type: Array as PropType<IStepsItem[]>,
    default: () => [],
    required: true,
  },
});
</script>

<style lang="scss">
.vc-steps {
  $self: &;

  @apply flex flex-wrap gap-x-5 gap-y-2.5;

  &__item {
    &--active {
      #{$self}__icon {
        @apply bg-[color:var(--color-primary)];
      }

      #{$self}__text {
        @apply text-[color:var(--color-body-text)];
      }
    }

    &--completed {
      #{$self}__icon {
        @apply bg-[color:var(--color-success)];
      }

      #{$self}__text {
        @apply text-[color:var(--color-success)];
      }
    }
  }

  &__step {
    @apply flex items-center gap-1.5;
  }

  &__icon {
    @apply flex shrink-0 items-center justify-center w-5 h-5 rounded-full
    text-sm font-extrabold text-white bg-gray-400;
  }

  &__text {
    @apply text-sm font-semibold text-gray-600;
  }
}
</style>
