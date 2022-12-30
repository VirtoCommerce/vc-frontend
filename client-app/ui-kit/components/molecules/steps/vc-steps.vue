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
  --vc-steps-icon-color: var(--color-steps-icon-color, var(--color-success));
  --vc-steps-number-color: var(--color-steps-number-color, var(--color-white));
  --vc-steps-number-bg: var(--color-steps-number-bg, theme("colors.gray.400"));
  --vc-steps-number-bg-active: var(--color-steps-number-bg-active, var(--color-primary));
  --vc-steps-name-color: var(--color-steps-name-color, theme("colors.gray.600"));
  --vc-steps-name-color-completed: var(--color-steps-name-color-completed, var(--color-success));
  --vc-steps-name-color-active: var(--color-steps-name-color-active, var(--color-body-text));

  @apply flex flex-wrap gap-x-5 gap-y-2.5;

  &__step {
    @apply flex items-center gap-1.5;
  }

  &__icon {
    --vc-icon-color: var(--vc-steps-icon-color);
  }

  &__number {
    @apply flex items-center justify-center w-5 h-5 rounded-full text-sm font-extrabold
    text-[color:var(--vc-steps-number-color)]
    bg-[color:var(--vc-steps-number-bg)];

    &--active {
      @apply bg-[color:var(--vc-steps-number-bg-active)];
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
