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
      <div ref="media" class="vc-product-card__media">
        <slot name="media" />
      </div>

      <div ref="content" class="vc-product-card__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";

export interface IProps {
  viewMode?: "grid" | "list";
  background?: boolean;
  border?: boolean;
}

withDefaults(defineProps<IProps>(), {
  viewMode: "grid",
  background: true,
});

const media = useTemplateRef("media");
const content = useTemplateRef("content");

onMounted(() => {
  if (content.value instanceof HTMLElement) {
    const elements = content.value.querySelectorAll(".vc-product-image, .vc-product-actions");

    elements.forEach((element) => {
      if (element instanceof HTMLElement && media.value instanceof HTMLElement) {
        media.value?.appendChild(element);
      }
    });
  }
});
</script>

<style lang="scss">
.vc-product-card {
  $self: &;
  $background: "";
  $border: "";
  $grid: "";
  $list: "";
  $titleOnly: "";
  $titleActions: "";
  $titleVendor: "";
  $titleVendorActions: "";
  $titlePrice: "";
  $noActionsNoVendor: "";
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
    @apply relative h-full;

    #{$background}#{$grid} & {
      @apply flex flex-col items-stretch p-5;

      @container (min-width: theme("containers.xs")) {
        @apply p-6;
      }
    }

    #{$background}#{$list} & {
      @apply grid p-3;

      @container (min-width: theme("containers.xl")) {
        @apply p-4;
      }
    }

    #{$grid} & {
      @apply items-center;

      grid-template-areas:
        "media"
        "title"
        "vendor"
        "properties"
        "price"
        "add-to-cart";
      grid-auto-rows: min-content min-content min-content min-content 1fr min-content;
    }

    #{$list} & {
      @apply items-center;

      @container (max-width: theme("containers.xl")) {
        grid-template-areas:
          "media title"
          "media vendor"
          "media price"
          "media add-to-cart";
        grid-auto-rows: repeat(5, min-content);
        grid-auto-columns: min-content 1fr;

        &:has(.vc-product-title:only-child):not(:has(.vc-product-actions)) {
          $titleOnly: &;
          grid-auto-rows: 1fr min-content min-content min-content;
        }

        &:has(.vc-product-title:only-child):has(.vc-product-actions) {
          $titleActions: &;
          grid-auto-rows: 1fr min-content min-content 1.5rem;
        }

        &:has(.vc-product-vendor:first-child:nth-last-child(2) ~ .vc-product-title),
        &:has(.vc-product-title:first-child:nth-last-child(2) ~ .vc-product-vendor) {
          &:not(:has(.vc-product-actions)) {
            $titleVendor: &;
            grid-auto-rows: 1fr 1fr min-content min-content;
          }

          &:has(.vc-product-actions) {
            $titleVendorActions: &;
            grid-auto-rows: 1fr 1fr min-content 1.5rem;
          }
        }

        &:has(.vc-product-price:first-child:nth-last-child(2) ~ .vc-product-title),
        &:has(.vc-product-title:first-child:nth-last-child(2) ~ .vc-product-price) {
          $titlePrice: &;

          grid-auto-rows: 1fr min-content 1fr min-content;

          &:has(.vc-product-actions) {
            grid-auto-rows: 1fr min-content 1fr 1.5rem;
          }
        }

        &:has(.vc-add-to-cart:first-child:nth-last-child(2) ~ .vc-product-title),
        &:has(.vc-product-title:first-child:nth-last-child(2) ~ .vc-add-to-cart) {
          grid-auto-rows: min-content min-content min-content min-content;
        }
      }

      @container (min-width: theme("containers.xl")) {
        grid-template-areas:
          "image title price add-to-cart"
          "image vendor price add-to-cart"
          "image actions price add-to-cart";
        grid-auto-rows: 1fr min-content 1fr;
        grid-auto-columns: min-content 1fr min-content min-content;

        &:not(:has(.vc-product-actions, .vc-product-vendor)) {
          $noActionsNoVendor: &;
          grid-auto-rows: 1fr min-content min-content;
        }

        &:has(.vc-product-vendor):not(:has(.vc-product-actions)) {
          grid-auto-rows: 1fr 1fr min-content;
        }
      }

      @container (min-width: theme("containers.3xl")) {
        grid-template-areas:
          "image title properties price add-to-cart"
          "image vendor properties price add-to-cart"
          "image actions properties price add-to-cart";
        grid-auto-columns: min-content 1fr min-content min-content min-content;
      }
    }
  }

  &__media {
    grid-area: media;

    @apply relative;

    #{$list} & {
      @apply flex flex-col me-3 self-start items-center;

      @container (min-width: theme("containers.xl")) {
        @apply contents;
      }
    }
  }

  &__content {
    @apply contents;
  }

  @at-root .vc-product-image {
    #{$self} & {
      grid-area: image;

      @apply self-start place-content-stretch;
    }

    #{$grid} & {
      @apply mb-4;
    }

    #{$list} & {
      @apply size-[4.5rem];

      @container (min-width: theme("containers.xl")) {
        @apply me-3 size-[5.375rem];
      }
    }
  }

  @at-root .vc-product-title {
    #{$self} & {
      grid-area: title;

      @apply text-sm;
    }

    #{$grid} & {
      @container (min-width: theme("containers.xxs")) {
        @apply text-lg;
      }
    }

    #{$list} & {
      @apply self-end;

      &:only-child {
        @apply self-center;
      }
    }

    #{$list}#{$titleActions} & {
      @container (min-width: theme("containers.xl")) {
        @apply self-end;
      }
    }

    #{$list}#{$noActionsNoVendor} & {
      @apply self-center;
    }
  }

  @at-root .vc-product-vendor {
    #{$self} & {
      grid-area: vendor;

      @apply mt-1 self-start;
    }
  }

  @at-root .vc-product-properties {
    #{$self} & {
      grid-area: properties;
    }

    #{$grid} & {
      @apply grow mt-3;

      @container (min-width: theme("containers.xxs")) {
        --vc-property-font-size: 0.875rem;

        @apply mt-4;
      }
    }

    #{$list} & {
      @apply hidden;

      @container (min-width: theme("containers.3xl")) {
        @apply block ms-3 w-[9.75rem];
      }

      @container (min-width: theme("containers.5xl")) {
        @apply w-60;
      }
    }
  }

  @at-root .vc-product-price {
    #{$self} & {
      grid-area: price;

      #{$titlePrice} & {
        @apply self-end;
      }
    }

    #{$grid} & {
      --font-size: 1.125rem;

      @apply mt-3;

      @container (min-width: theme("containers.xxs")) {
        --font-size: 1.5rem;

        @apply mt-4;
      }
    }

    #{$list} & {
      --font-size: 1.125rem;

      @apply mt-1;

      @container (min-width: theme("containers.xl")) {
        --font-size: 0.875rem;

        @apply mt-0 ms-3 w-[7.5rem];
      }

      @container (min-width: theme("containers.4xl")) {
        --font-size: 1.125rem;

        @apply w-[9.5rem];
      }
    }
  }

  @at-root .vc-product-actions {
    #{$grid} & {
      @apply absolute -top-4 -right-[1.1rem];
    }

    #{$list} & {
      grid-area: actions;

      @apply mt-2.5;

      @container (min-width: theme("containers.xl")) {
        @apply self-start mt-2;
      }
    }
  }

  @at-root .vc-add-to-cart,
    .vc-variations-button {
    #{$self} & {
      grid-area: add-to-cart;
    }

    #{$grid} & {
      @apply mt-3;

      @container (min-width: theme("containers.xs")) {
        @apply mt-4;
      }
    }

    #{$list} & {
      @apply mt-3;

      @container (min-width: theme("containers.sm")) {
        @apply w-72;
      }

      @container (min-width: theme("containers.xl")) {
        @apply mt-0 ms-3 w-44;
      }

      @container (min-width: theme("containers.4xl")) {
        @apply mt-0 ms-3 w-60;
      }
    }
  }
}
</style>
