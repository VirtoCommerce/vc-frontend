<template>
  <div
    ref="root"
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
      <div ref="imageContainer" class="vc-product-card__image-container"></div>

      <slot />
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

const root = useTemplateRef("root");
const imageContainer = useTemplateRef("imageContainer");

onMounted(() => {
  if (root.value instanceof HTMLElement) {
    const actionsElement = root.value.querySelector(".vc-product-actions");
    const imageElement = root.value.querySelector(".vc-product-image");

    if (imageContainer.value instanceof HTMLElement) {
      if (imageElement) {
        imageContainer.value.appendChild(imageElement);
      }

      if (actionsElement) {
        imageContainer.value.appendChild(actionsElement);
      }
    }
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
  $titleCenter: "";

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
    @apply relative grid h-full;

    #{$background}#{$grid} & {
      @apply p-5;

      @container (min-width: theme("containers.xs")) {
        @apply p-6;
      }
    }

    #{$background}#{$list} & {
      @apply p-3;

      @container (min-width: theme("containers.xl")) {
        @apply p-4;
      }
    }

    #{$grid} & {
      @apply items-center;

      grid-template-areas:
        "image-container"
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
        "image-container title"
        "image-container vendor"
        "image-container price"
        "image-container add-to-cart";
      grid-auto-rows: repeat(4, min-content);
      grid-auto-columns: min-content 1fr;

      &:not(:has(.vc-add-to-cart, .add-to-cart, .vc-variations-button)) {
        grid-auto-rows: 1fr 1fr min-content min-content;

        &:not(:has(.vc-product-vendor)) {
          $titleCenter: &;

          grid-auto-rows: 1fr min-content min-content min-content;
        }
      }

      @container (min-width: theme("containers.xl")) {
        grid-template-areas:
          "image title price add-to-cart"
          "image vendor price add-to-cart"
          "image actions price add-to-cart";
        grid-auto-rows: 1fr min-content 1fr;
        grid-auto-columns: min-content 1fr min-content min-content;

        &:not(:has(.vc-product-vendor, * .vc-product-actions)) {
          $titleCenter: &;

          grid-auto-rows: 1fr min-content min-content;
        }

        &:has(.vc-product-vendor):not(:has(* .vc-product-actions)) {
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

  &__image-container {
    grid-area: image-container;

    @apply relative;

    #{$list} & {
      @apply flex flex-col me-3 self-start items-center;

      @container (min-width: theme("containers.xl")) {
        @apply contents;
      }
    }
  }

  @at-root .vc-product-image {
    #{$self} & {
      grid-area: image;

      @apply self-end place-content-stretch;
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

      @apply text-sm self-end;
    }

    #{$grid} & {
      @container (min-width: theme("containers.xxs")) {
        @apply text-lg;
      }
    }

    #{$titleCenter} & {
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
      @apply mt-3;

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
    .add-to-cart,
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
