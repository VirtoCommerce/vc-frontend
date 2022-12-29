<template>
  <div class="vc-steps">
    <router-link class="vc-steps__step" to="/cart">
      <VcIcon url="/static/images/arrow-left-circle.svg#main" size="sm" class="vc-steps__icon" />
      <VcTypography class="vc-steps__name vc-steps__name--completed" tag-name="div" font-size="medium">
        Back to Cart
      </VcTypography>
    </router-link>

    <div class="vc-steps__step" v-for="(step, index) in steps" :key="index">
      <VcIcon v-if="step.completed" url="/static/images/check-circle.svg#main" size="sm" class="vc-steps__icon" />

      <div
        v-else
        class="vc-steps__number"
        :class="{
          'vc-steps__number--active': step.active,
        }"
      >
        {{ index + 2 }}
      </div>

      <VcTypography
        class="vc-steps__name"
        :class="{
          'vc-steps__name--active': step.active,
          'vc-steps__name--completed': step.completed,
        }"
        tag-name="div"
        font-size="medium"
      >
        {{ step.name }}
      </VcTypography>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  steps: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
});
</script>

<style lang="scss">
.vc-steps {
  @apply flex flex-wrap gap-x-5 gap-y-2.5;

  &__step {
    @apply flex items-center gap-1.5;
  }

  &__icon {
    --vc-icon-color: var(--vc-steps-icon-color, var(--color-success));
  }

  &__number {
    @apply flex items-center justify-center w-5 h-5 rounded-full text-sm font-extrabold text-white;

    color: var(--vc-steps-number-color, var(--color-white));
    background-color: var(--vc-steps-number-bg, theme("colors.gray.400"));

    &--active {
      background-color: var(--vc-steps-number-bg-active, var(--color-primary));
    }
  }

  &__name {
    @apply text-14 font-semibold;

    --vc-typography-color: var(--vc-steps-name-color, theme("colors.gray.600"));

    &--completed {
      --vc-typography-color: var(--vc-steps-name-color-completed, var(--color-success));
    }

    &--active {
      @apply font-bold;

      --vc-typography-color: var(--vc-steps-name-color-active, var(--color-body-text));
    }
  }
}
</style>
