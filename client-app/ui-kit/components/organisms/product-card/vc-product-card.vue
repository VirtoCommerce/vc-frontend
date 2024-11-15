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
  viewMode?: "grid" | "list" | "item";
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
    const elements = content.value.querySelectorAll(".vc-product-image, .vc-product-actions, .vc-radio-button");

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
  $item: "";

  $hasImage: ":has(.vc-product-image)";
  $hasActions: ":has(.vc-product-actions)";
  $hasTitle: ":has(.vc-product-title)";
  $hasVendor: ":has(.vc-product-vendor)";
  $hasProperties: ":has(.vc-product-properties)";
  $hasPrice: ":has(.vc-product-price:not(.vc-product-total))";
  $hasTotal: ":has(.vc-product-total)";

  $hasAddToCart: ":has(.vc-add-to-cart, .vc-variations-button)";
  $hasTitleOnly: ":has(.vc-product-title:only-child)";
  $hasTitleVendorOnly: ":has(.vc-product-vendor:first-child:nth-last-child(2)~.vc-product-title), &:has(.vc-product-title:first-child:nth-last-child(2)~.vc-product-vendor)";
  $hasTitlePriceOnly: ":has(.vc-product-price:first-child:nth-last-child(2)~.vc-product-title), &:has(.vc-product-title:first-child:nth-last-child(2)~.vc-product-price)";
  $hasTitleAddToCartOnly: ":has(.vc-add-to-cart:first-child:nth-last-child(2)~.vc-product-title), &:has(.vc-product-title:first-child:nth-last-child(2)~.vc-add-to-cart)";

  --bg: var(--vc-product-card-bg-color, theme("colors.additional.50"));

  @apply @container;

  &--view-mode {
    &--grid {
      $grid: &;
    }

    &--list {
      $list: &;
    }

    &--item {
      $item: &;
    }
  }

  &--background {
    $background: &;

    @apply bg-[--bg];
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

    #{$background}#{$item} & {
      @apply p-3;

      @container (min-width: theme("containers.2xl")) {
        @apply p-4;
      }
    }

    #{$grid} & {
      @apply flex flex-col items-stretch;

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
      @apply grid items-center;

      @container (max-width: theme("containers.xl")) {
        grid-template-areas:
          "media title"
          "media vendor"
          "media properties"
          "media price"
          "media add-to-cart";
        grid-auto-rows: repeat(5, min-content);
        grid-auto-columns: min-content 1fr 1fr;

        &#{$hasTitleOnly} {
          grid-auto-rows: 1fr min-content min-content min-content min-content;

          &#{$hasActions} {
            grid-auto-rows: 1fr min-content min-content min-content 1.5rem;
          }
        }

        &#{$hasTitleVendorOnly} {
          grid-auto-rows: 1fr 1fr min-content min-content min-content;

          &#{$hasActions} {
            grid-auto-rows: 1fr 1fr min-content min-content 1.5rem;
          }
        }

        &#{$hasTitlePriceOnly} {
          grid-auto-rows: 1fr min-content min-content 2fr min-content;

          &#{$hasActions} {
            grid-auto-rows: 1fr min-content min-content 2fr 1.5rem;
          }
        }

        &#{$hasTitleAddToCartOnly} {
          grid-auto-rows: min-content min-content min-content min-content min-content;
        }
      }

      @container (min-width: theme("containers.xl")) {
        grid-template-areas:
          "image title properties price add-to-cart"
          "image vendor properties price add-to-cart"
          "image actions properties price add-to-cart";
        grid-auto-rows: 1fr min-content 1fr;
        grid-auto-columns: min-content 1fr min-content min-content min-content;

        &:not(#{$hasActions}):not(#{$hasVendor}) {
          grid-auto-rows: 1fr min-content min-content;
        }

        &#{$hasVendor}:not(#{$hasActions}) {
          grid-auto-rows: 1fr 1fr min-content;
        }

        &#{$hasTitlePriceOnly} {
          grid-auto-rows: 1fr min-content min-content;

          &#{$hasActions} {
            grid-auto-rows: 1fr min-content 1fr;
          }
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

    #{$item} & {
      @apply grid items-center;

      @container (max-width: theme("containers.2xl")) {
        grid-template-areas:
          "media title title"
          "media vendor vendor"
          "media properties properties"
          "media price price"
          "media add-to-cart total";
        grid-auto-rows: repeat(5, min-content);
        grid-auto-columns: min-content min-content 1fr;

        &#{$hasTitleOnly} {
          grid-auto-rows: 1fr min-content min-content min-content min-content;
        }

        &#{$hasTitleVendorOnly} {
          grid-auto-rows: 1fr 1fr min-content min-content min-content;
        }

        &#{$hasTitlePriceOnly} {
          grid-auto-rows: 1fr min-content min-content min-content min-content;
        }

        &#{$hasTitleAddToCartOnly} {
          grid-auto-rows: min-content min-content min-content min-content min-content;
        }
      }

      @container (min-width: theme("containers.2xl")) {
        grid-template-areas:
          "select image title properties price add-to-cart total"
          "select image vendor properties price add-to-cart total"
          ". . . properties . . .";
        grid-auto-rows: 2rem 2rem min-content;
        grid-auto-columns: min-content min-content 1fr min-content min-content min-content min-content;

        &:not(#{$hasVendor}) {
          grid-auto-rows: 4rem min-content min-content;
        }
      }

      @container (min-width: theme("containers.3xl")) {
        grid-template-areas:
          "select image title properties price add-to-cart total"
          "select image vendor properties price add-to-cart total"
          ". . . properties . . .";
        grid-auto-columns: min-content min-content 1fr min-content min-content min-content min-content;
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

    #{$item} & {
      @apply flex flex-col me-3 self-start items-center;

      @container (min-width: theme("containers.2xl")) {
        @apply contents;
      }
    }
  }

  &__content {
    @apply contents;
  }
}
</style>
