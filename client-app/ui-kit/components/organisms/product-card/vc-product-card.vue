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
        <div v-if="viewMode === 'grid'" class="vc-product-card__expander"></div>

        <slot />
      </div>

      <div v-if="viewMode === 'list' && $slots.menu" class="vc-product-card__menu">
        <VcDropdownMenu placement="bottom-end">
          <template #trigger="{ triggerProps }">
            <VcButton
              :aria-label="menuLabel || $t('ui_kit.labels.actions')"
              icon="ellipsis-vertical"
              color="secondary"
              variant="ghost"
              size="xs"
              v-bind="triggerProps"
            />
          </template>

          <template #content="{ close }">
            <slot name="menu" :close="close" />
          </template>
        </VcDropdownMenu>
      </div>
    </div>

    <slot name="expanded-content" />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";
import { usePopoverHostTeleport } from "@/ui-kit/composables";

export interface IProps {
  viewMode?: "grid" | "list" | "item";
  background?: boolean;
  border?: boolean;
  /** Accessible name of the ⋮ menu button (list view). */
  menuLabel?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  viewMode: "grid",
  background: true,
});

defineSlots<{
  default?: () => unknown;
  media?: () => unknown;
  "expanded-content"?: () => unknown;
  /** `VcMenuItem`s of the ⋮ menu shown in the compact list view (secondary actions: add to list, compare). */
  menu?: (scope: { close: () => void }) => unknown;
}>();

// List view: the ⋮ menu floats in the app-level popover host; rendered in place it is sized by the narrow menu column.
usePopoverHostTeleport(() => props.viewMode === "list");

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
  $hasTitleProductButtonOnly: ":has(.vc-product-title):has(.vc-product-button):not(#{$hasVendor}):not(#{$hasPrice}):not(#{$hasAddToCart}):not(#{$hasProperties}):not(#{$hasTotal})";

  --bg: var(--vc-product-card-bg-color, theme("colors.additional.50"));
  --radius: var(--vc-product-card-radius, var(--vc-radius, 0.5rem));
  --menu-icon-size: var(--vc-product-card-menu-icon-size, 1.25rem);

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
    @apply rounded-[--radius] border border-neutral-100 shadow-md;

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

      @container (min-width: theme("containers.2xl")) {
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
    }

    #{$list} & {
      @apply grid items-center;

      // Compact product row: thumbnail + identity on top, price and control under a divider.
      @container (width < theme("containers.2xl")) {
        grid-template-areas:
          "media title title menu"
          "media vendor vendor vendor"
          "media properties properties properties"
          "divider divider divider divider"
          "price price add-to-cart add-to-cart"
          "meta meta meta meta";
        grid-template-columns: min-content minmax(0, 1fr) auto auto;
        grid-auto-rows: min-content;

        // The divider row between identity and price/control; nothing to divide on an identity-only row.
        &::after {
          @apply my-3 border-t border-neutral-200;

          content: "";
          grid-area: divider;
        }

        &#{$hasTitleOnly},
        &#{$hasTitleVendorOnly} {
          &::after {
            @apply hidden;
          }
        }

        &#{$hasTitleOnly} {
          grid-template-areas: "media title title menu";
          grid-auto-rows: 1fr;
        }

        &#{$hasTitleVendorOnly} {
          grid-template-areas:
            "media title title menu"
            "media vendor vendor vendor";
          grid-auto-rows: 1fr 1fr;
        }

        &#{$hasTitlePriceOnly} {
          grid-template-areas:
            "media title title menu"
            "divider divider divider divider"
            "price price price price";
        }

        &#{$hasTitleAddToCartOnly},
        &#{$hasTitleProductButtonOnly} {
          grid-template-areas:
            "media title title menu"
            "divider divider divider divider"
            "add-to-cart add-to-cart add-to-cart add-to-cart"
            "meta meta meta meta";
        }
      }

      @container (min-width: theme("containers.2xl")) {
        grid-template-areas:
          "image title price add-to-cart"
          "image vendor price add-to-cart"
          "image actions price add-to-cart";
        grid-auto-rows: 1fr min-content 1fr;
        grid-auto-columns: min-content 1fr min-content min-content;

        &:not(#{$hasActions}):not(#{$hasVendor}) {
          grid-auto-rows: 1fr min-content min-content;
        }

        &#{$hasVendor}:not(#{$hasActions}) {
          grid-auto-rows: 1fr 1fr min-content;
        }

        &:#{$hasActions}:not(#{$hasVendor}) {
          grid-auto-rows: 1fr min-content 1fr;
        }
      }

      @container (min-width: theme("containers.4xl")) {
        grid-template-areas:
          "image title properties price add-to-cart"
          "image vendor properties price add-to-cart"
          "image actions properties price add-to-cart";
        grid-auto-columns: min-content 1fr min-content min-content min-content;
      }
    }

    #{$item} & {
      @apply grid items-center;

      @container (width < theme("containers.2xl")) {
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

    #{$grid} & {
      @apply order-1;
    }

    #{$list} & {
      @apply flex flex-col me-3 self-start items-center;

      @container (min-width: theme("containers.2xl")) {
        @apply contents;
      }
    }

    #{$item} & {
      @apply flex flex-col me-3 self-start items-center;

      @container (min-width: theme("containers.2xl")) {
        @apply contents;
      }
    }

    &:empty {
      @apply hidden;
    }
  }

  &__content {
    @apply contents;
  }

  &__menu {
    --vc-button-icon-size: var(--menu-icon-size);

    @apply relative z-[2] -mt-1 -me-1.5 ms-2 self-start;

    grid-area: menu;

    @container (min-width: theme("containers.2xl")) {
      @apply hidden;
    }
  }

  &__expander {
    @apply grow order-5;
  }
}
</style>
