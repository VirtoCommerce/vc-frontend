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
});
</script>

<style lang="scss">
.vc-card-widget {
  $hideMobileTitle: "";

  @apply relative bg-[color:var(--color-white)];

  @screen lg {
    @apply border rounded shadow-md-x;
  }

  &:after {
    @apply content-[''] z-[1] absolute top-full w-full h-3 bg-gradient-to-b from-[#f1f1f1];

    @screen lg {
      @apply content-none;
    }
  }

  &__title {
    @apply flex items-center gap-3 px-4 pt-6 pb-3;

    @screen xs {
      @apply px-7;
    }

    @screen lg {
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

    @screen xs {
      @apply px-7;
    }

    @screen lg {
      @apply p-5;
    }

    #{$hideMobileTitle} ~ & {
      @apply pt-7 lg:pt-5;
    }
  }
}
</style>
