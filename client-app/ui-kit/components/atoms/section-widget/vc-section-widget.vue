<template>
  <div class="vc-section-widget">
    <slot name="title" v-if="title">
      <div
        :class="{
          'vc-section-widget__title': true,
          'vc-section-widget__title--hide-mobile': hideMobileTitle,
          'vc-section-widget__title--hide-desktop': hideDesktopTitle,
        }"
      >
        <VcHexagon>
          <VcIcon :name="icon" />
        </VcHexagon>

        <VcTypography size="h3" weight="extrabold">
          {{ title }}
        </VcTypography>
      </div>
    </slot>

    <div :class="contentClasses ?? 'vc-section-widget__content'">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: null,
  },

  icon: {
    type: String,
    default: null,
  },

  hideMobileTitle: {
    type: Boolean,
    default: false,
  },

  hideDesktopTitle: {
    type: Boolean,
    default: false,
  },

  contentClasses: {
    type: String,
    default: null,
  },
});
</script>

<style lang="scss">
.vc-section-widget {
  @apply relative bg-[color:var(--color-white)]
  lg:border lg:rounded lg:shadow-md-x;

  &:after {
    @apply content-[''] z-[1] absolute top-full w-full h-3
    bg-gradient-to-b from-[#f1f1f1] lg:content-none;
  }

  &__title {
    @apply flex items-center gap-3 px-7 pt-6 pb-3;

    &--hide-mobile {
      @apply hidden lg:block;
    }

    &--hide-desktop {
      @apply lg:hidden;
    }
  }

  &__content {
    @apply px-7 pt-3 pb-7 lg:pb-6;
  }
}
</style>
