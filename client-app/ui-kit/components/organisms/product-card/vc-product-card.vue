<template>
  <div
    :class="[
      'vc-product-card',
      `vc-product-card--view-mode--${viewMode}`,
      {
        'vc-product-card--background': background,
        'vc-product-card--border': border,
      },
    ]"
  >
    <div class="vc-product-card__wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  viewMode?: "grid" | "list";
  background?: boolean;
  border?: boolean;
}

withDefaults(defineProps<IProps>(), {
  viewMode: "grid",
  background: true,
});
</script>

<style lang="scss">
.vc-product-card {
  $self: &;
  $background: "";
  $border: "";
  $grid: "";
  $list: "";

  @apply @container;

  &--view-mode {
    &--grid {
      $grid: &;
    }

    &--list {
      $list: &;
    }
  }

  &--background {
    $background: &;

    @apply bg-additional-50;
  }

  &--border {
    @apply rounded border border-neutral-100 shadow-md;

    &:hover {
      @apply shadow-lg;
    }
  }

  &__wrapper {
    @apply grid h-full;

    #{$background}#{$grid} & {
      @apply p-5;

      @container (width > theme(containers.xs)) {
        @apply p-6;
      }
    }

    #{$background}#{$list} & {
      @apply p-3;

      @container (width > theme(containers.xl)) {
        @apply p-4;
      }
    }

    #{$grid} & {
      @apply items-center;

      grid-template-areas:
        "image"
        "title"
        "vendor"
        "properties"
        "price"
        "add-to-cart";
      grid-auto-rows: min-content min-content min-content min-content 1fr min-content;
    }

    #{$list} & {
      @apply items-center;

      grid-template-areas:
        "image title"
        "image vendor"
        "image price"
        "image add-to-cart";
      grid-auto-rows: min-content;
      grid-auto-columns: min-content 1fr;

      @container (width > theme(containers.xl)) {
        grid-template-areas:
          "image . price add-to-cart"
          "image title price add-to-cart"
          "image vendor price add-to-cart"
          "image . price add-to-cart";
        grid-auto-columns: min-content 1fr min-content min-content;
      }

      @container (width > theme(containers.3xl)) {
        grid-template-areas:
          "image . properties price add-to-cart"
          "image title properties price add-to-cart"
          "image vendor properties price add-to-cart"
          "image . properties price add-to-cart";
        grid-auto-columns: min-content 1fr min-content min-content min-content;
      }
    }
  }

  @at-root .vc-product-image {
    #{$self} & {
      grid-area: image;
      align-self: flex-start;
    }

    #{$grid} & {
      @apply mb-4;
    }

    #{$list} & {
      @apply me-3 size-[4.5rem];

      @container (width > theme(containers.xl)) {
        @apply size-[5.375rem];
      }
    }
  }

  @at-root .vc-product-title {
    #{$self} & {
      grid-area: title;

      @apply text-sm;
    }

    #{$grid} & {
      @container (width > theme(containers.xxs)) {
        @apply text-lg;
      }
    }

    #{$list}:not(:has(* .vc-product-vendor)) & {
      @container (width > theme(containers.xl)) {
        grid-row-start: 1;
        grid-row-end: -1;
      }
    }
  }

  @at-root .vc-product-vendor {
    #{$self} & {
      grid-area: vendor;

      @apply mt-1;
    }
  }

  @at-root .vc-product-properties {
    #{$self} & {
      grid-area: properties;
    }

    #{$grid} & {
      @apply mt-3;

      @container (width > theme(containers.xxs)) {
        --vc-property-font-size: 0.875rem;

        @apply mt-4;
      }
    }

    #{$list} & {
      @apply hidden;

      @container (width > theme(containers.3xl)) {
        @apply block ms-3 w-[9.75rem];
      }

      @container (width > theme(containers.5xl)) {
        @apply w-60;
      }
    }
  }

  @at-root .vc-product-price {
    #{$self} & {
      grid-area: price;
    }

    #{$grid} & {
      --font-size: 1.125rem;

      @apply mt-3;

      @container (width > theme(containers.xxs)) {
        --font-size: 1.5rem;

        @apply mt-4;
      }
    }

    #{$list} & {
      --font-size: 1.125rem;

      @apply mt-1;

      @container (width > theme(containers.xl)) {
        --font-size: 0.875rem;

        @apply mt-0 ms-3 w-[7.5rem];
      }

      @container (width > theme(containers.4xl)) {
        --font-size: 1.125rem;

        @apply w-[9.5rem];
      }
    }
  }

  @at-root .vc-add-to-cart,
    .add-to-cart,
    .vc-variations-button {
    #{$self} & {
      grid-area: add-to-cart;
    }

    #{$grid} & {
      @apply mt-3;

      @container (width > theme(containers.xs)) {
        @apply mt-4;
      }
    }

    #{$list} & {
      @apply mt-3;

      @container (width > theme(containers.sm)) {
        @apply w-72;
      }

      @container (width > theme(containers.xl)) {
        @apply mt-0 ms-3 w-44;
      }

      @container (width > theme(containers.4xl)) {
        @apply mt-0 ms-3 w-60;
      }
    }
  }
}
</style>
