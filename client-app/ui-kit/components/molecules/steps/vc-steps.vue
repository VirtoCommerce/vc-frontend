<template>
  <ul class="vc-steps">
    <transition-group :name="transitionName">
      <li
        v-for="(step, index) in steps.filter((step) => !step.hidden)"
        :key="step.text"
        :class="[
          'vc-steps__item',
          {
            'vc-steps__item--active': isActiveStep(index),
            'vc-steps__item--completed': isCompletedStep(index),
            'vc-steps__item--disabled': !isCompletedStep(index) && isDisabledStep(step),
          },
        ]"
      >
        <component
          :is="step.route && isCompletedStep(index) && !isDisabledStep(step) ? 'router-link' : 'span'"
          :to="step.route"
          class="vc-steps__step"
        >
          <span class="vc-steps__icon">
            <!-- Custom icon -->
            <VcIcon v-if="step.icon" :name="step.icon" size="xxs" />

            <!-- Completed icon -->
            <VcIcon v-else-if="isCompletedStep(index)" name="check-bold" size="xxs" />

            <!-- Step number -->
            <template v-else>{{ index + startStepIndex }}</template>
          </span>

          <span class="vc-steps__text">{{ step.text }}</span>
        </component>
      </li>
    </transition-group>
  </ul>
</template>

<script setup lang="ts">
interface IProps {
  steps?: IStepsItem[];
  currentStepIndex?: number;
  startStepIndex?: number;
  disabled?: boolean;
  transitionName?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  steps: () => [],
  currentStepIndex: -1,
  startStepIndex: 1,
});

function isActiveStep(index: number) {
  return index + props.startStepIndex === props.currentStepIndex;
}

function isCompletedStep(index: number) {
  return index + props.startStepIndex < props.currentStepIndex;
}

function isDisabledStep(step: IStepsItem) {
  return step.disabled || props.disabled;
}
</script>

<style lang="scss">
.vc-steps {
  $itemActive: "";
  $itemCompleted: "";
  $itemDisabled: "";

  @apply flex flex-wrap gap-x-5 gap-y-2.5;

  &__item {
    &--active {
      $itemActive: &;
    }

    &--completed {
      $itemCompleted: &;
    }

    &--disabled {
      $itemDisabled: &;
    }
  }

  &__step {
    @apply flex items-center gap-1.5;
  }

  &__icon {
    @apply flex shrink-0 items-center justify-center w-5 h-5 rounded-full
    text-sm font-black text-additional-50 bg-neutral-400;

    #{$itemActive}:not(#{$itemDisabled}) & {
      @apply bg-primary;
    }

    #{$itemCompleted}:not(#{$itemDisabled}) & {
      @apply bg-success;
    }
  }

  &__text {
    @apply text-sm font-bold text-neutral-600;

    #{$itemActive}:not(#{$itemDisabled}) & {
      @apply text-neutral-900;
    }

    #{$itemCompleted}:not(#{$itemDisabled}) & {
      @apply text-success;
    }
  }
}
</style>
