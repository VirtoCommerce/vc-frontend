<template>
  <div class="vc-card-widget">
    <div
      :class="[
        'vc-card-widget__title',
        {
          'vc-card-widget__title--hide-mobile': hideMobileTitle || !title,
          'vc-card-widget__title--hide-desktop': hideDesktopTitle || !title,
        },
      ]"
    >
      <div v-if="icon" class="vc-card-widget__icon">
        <VcHexagonIcon :icon="icon" />
      </div>

      <VcTypography variant="h3" weight="extrabold">
        {{ title }}
      </VcTypography>
    </div>

    <div class="vc-card-widget__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface IProps {
  hideMobileTitle?: boolean;
  hideDesktopTitle?: boolean;

  title?: string;
  icon?: string;
}

defineProps<IProps>();

console.warn("[UIKit][warn] VcCardWidget is deprecated, use VcWidget instead.");
</script>

<style lang="scss">
.vc-card-widget {
  $hideMobileTitle: "";

  @apply relative bg-[color:var(--color-white)];

  @media (min-width: theme("screens.lg")) {
    @apply border rounded shadow-md-x;
  }

  &:after {
    @apply content-[''] z-[1] absolute top-full w-full h-3 bg-gradient-to-b from-[#f1f1f1];

    @media (min-width: theme("screens.lg")) {
      @apply content-none;
    }
  }

  &__title {
    @apply flex items-center gap-3 px-4 pt-6 pb-3;

    @media (min-width: theme("screens.xs")) {
      @apply px-7;
    }

    @media (min-width: theme("screens.lg")) {
      @apply px-5 py-3 border-b;
    }

    &--hide-mobile {
      $hideMobileTitle: &;

      @apply hidden lg:flex;
    }

    &--hide-desktop {
      @apply lg:hidden;
    }
  }

  &__icon {
    @apply lg:hidden;
  }

  &__content {
    @apply px-4 pt-3 pb-7;

    @media (min-width: theme("screens.xs")) {
      @apply px-7;
    }

    @media (min-width: theme("screens.lg")) {
      @apply p-5;
    }

    #{$hideMobileTitle} ~ & {
      @apply pt-7 lg:pt-5;
    }
  }
}
</style>
