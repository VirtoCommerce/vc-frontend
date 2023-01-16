<template>
  <div class="vc-card-widget">
    <slot name="title" v-if="title">
      <div
        :class="[
          'vc-card-widget__title',
          {
            'vc-section-widget__title--hide-mobile': hideMobileTitle,
            'vc-section-widget__title--hide-desktop': hideDesktopTitle,
          },
        ]"
      >
        <div class="vc-card-widget__icon">
          <VcHexagonIcon :icon="icon" />
        </div>

        <VcTypography variant="h3" weight="extrabold">
          {{ title }}
        </VcTypography>
      </div>
    </slot>

    <div :class="contentClasses ?? 'vc-card-widget__content'">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  hideMobileTitle: Boolean,
  hideDesktopTitle: Boolean,

  title: {
    type: String,
    default: "",
  },

  icon: {
    type: String,
    default: "",
  },

  contentClasses: {
    type: String,
    default: null,
  },
});
</script>

<style lang="scss">
.vc-card-widget {
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
    @apply flex items-center gap-3 px-7 pt-6 pb-3;

    @media (min-width: theme("screens.lg")) {
      @apply px-6 py-3;
    }

    &--hide-mobile {
      @apply hidden lg:block;
    }

    &--hide-desktop {
      @apply lg:hidden;
    }
  }

  &__icon {
    @apply lg:hidden;
  }

  &__content {
    @apply px-7 pt-3 pb-7;

    @media (min-width: theme("screens.lg")) {
      @apply px-6 pb-5 border-t;
    }
  }
}
</style>
