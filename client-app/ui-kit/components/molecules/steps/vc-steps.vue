<template>
  <ul class="vc-steps">
    <transition-group :name="transitionName">
      <li
        v-for="(step, index) in steps"
        :key="step.text"
        :class="[
          'vc-steps__item',
          {
            'vc-steps__item--active': index + startStepIndex === currentStepIndex,
            'vc-steps__item--completed': index + startStepIndex < currentStepIndex,
            'vc-steps__item--disabled': disabled,
          },
        ]"
      >
        <component
          :is="step.route && index + startStepIndex < currentStepIndex && !disabled ? 'router-link' : 'span'"
          :to="step.route"
          class="vc-steps__step"
        >
          <span class="vc-steps__icon">
            <!-- Custom icon -->
            <VcIcon v-if="step.icon" :name="step.icon" size="xxs" />

            <!-- Completed icon -->
            <VcIcon v-else-if="index + startStepIndex < currentStepIndex" name="check-bold" size="xxs" />

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

withDefaults(defineProps<IProps>(), {
  steps: () => [],
  currentStepIndex: -1,
  startStepIndex: 1,
});
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
    text-sm font-extrabold text-white bg-gray-400;

    #{$itemActive}:not(#{$itemDisabled}) & {
      @apply bg-[color:var(--color-primary)];
    }

    #{$itemCompleted}:not(#{$itemDisabled}) & {
      @apply bg-[color:var(--color-success)];
    }
  }

  &__text {
    @apply text-sm font-semibold text-gray-600;

    #{$itemActive}:not(#{$itemDisabled}) & {
      @apply text-[color:var(--color-body-text)];
    }

    #{$itemCompleted}:not(#{$itemDisabled}) & {
      @apply text-[color:var(--color-success)];
    }
  }
}
</style>
