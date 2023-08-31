<template>
  <div class="vc-section-widget">
    <div
      :class="[
        'vc-section-widget__title',
        {
          'vc-section-widget__title--hide-mobile': hideMobileTitle || !title,
          'vc-section-widget__title--hide-desktop': hideDesktopTitle || !title,
        },
      ]"
    >
      <VcHexagonIcon :icon="icon" class="vc-section-widget__hexagon" />

      <VcTypography variant="h3" weight="extrabold">
        {{ title }}
      </VcTypography>
    </div>

    <div class="vc-section-widget__content">
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
</script>

<style lang="scss">
.vc-section-widget {
  $hideMobileTitle: "";
  $hideDesktopTitle: "";

  @apply relative bg-[color:var(--color-white)];

  @screen lg {
    @apply border rounded shadow-md-x;
  }

  &:after {
    @media screen {
      @apply content-[''] z-[1] absolute top-full w-full h-3 bg-gradient-to-b from-[#f1f1f1];
    }

    @screen lg {
      @apply content-none;
    }

    @media print {
      @apply border-b;
    }
  }

  &__title {
    @apply flex items-center gap-3 px-4 pt-6 pb-3;

    @screen xs {
      @apply px-7;
    }

    @media print {
      @apply px-0;
    }

    &--hide-mobile {
      $hideMobileTitle: &;

      @apply hidden lg:flex;
    }

    &--hide-desktop {
      $hideDesktopTitle: &;

      @apply lg:hidden;
    }
  }

  &__hexagon {
    @apply shrink-0;

    @media print {
      @apply hidden;
    }
  }

  &__content {
    @apply px-4 pt-3 pb-7;

    @screen xs {
      @apply px-7;
    }

    @screen lg {
      @apply pb-6;
    }

    @media print {
      @apply px-0;
    }

    #{$hideMobileTitle} ~ & {
      @apply pt-7 lg:pt-3;
    }

    #{$hideDesktopTitle} ~ & {
      @screen lg {
        @apply pt-6;
      }
    }
  }
}
</style>
