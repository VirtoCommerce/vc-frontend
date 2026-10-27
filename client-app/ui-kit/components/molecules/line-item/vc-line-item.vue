<template>
  <!--  eslint-disable -->
  <div
    :class="[
      'vc-line-item',
      {
        'vc-line-item--removable': removable,
        'vc-line-item--disabled': disabled,
        'vc-line-item--selected': selected,
        'vc-line-item--deleted': deleted,
        'vc-line-item--readonly': hasFixedQuantity,
        'vc-line-item--with-meta': hasMetaLine,
        'vc-line-item--with-total': hasTotalLine,
      },
    ]"
    @keydown="changeFocus"
  >
    <div v-if="$slots.before" class="vc-line-item__before">
      <slot name="before" />
    </div>

    <div class="vc-line-item__main">
      <VcCheckbox
        v-if="selectable"
        v-model="isSelected"
        class="vc-line-item__checkbox"
        :name="$t('ui_kit.labels.toggle_vendor_select')"
        test-id="vc-line-item-checkbox"
        @change="$emit('select', isSelected)"
      />

      <div v-if="hasImageContainer" class="vc-line-item__img-container">
        <!--  IMAGE -->
        <VcImage class="vc-line-item__img" :src="imageUrl" :alt="name" size-suffix="sm" lazy />

        <div class="vc-line-item__img-actions">
          <slot name="after-image" />
        </div>
      </div>

      <div
        :class="[
          'vc-line-item__content',
          {
            'vc-line-item__content--with-image': hasImageContainer,
            'vc-line-item__content--selectable': !hasImageContainer && selectable,
          },
        ]"
      >
        <div class="vc-line-item__name-container">
          <VcProductTitle
            class="vc-line-item__name"
            :disabled="disabled || deleted"
            :to="route"
            :title="name"
            :target="browserTarget"
            @click="$emit('linkClick')"
          >
            {{ name }}
          </VcProductTitle>

          <div class="vc-line-item__name-actions">
            <slot name="after-title" />
          </div>
        </div>

        <div
          v-if="withProperties || withPrice"
          :class="[
            'vc-line-item__properties',
            {
              'vc-line-item__properties--wide': !withPrice,
              'vc-line-item__properties--hide': !withProperties && withPrice,
            },
          ]"
        >
          <template v-if="withProperties">
            <VcProperty
              v-for="property in properties"
              :key="property.name"
              :label="property.label!"
              :disabled="disabled || deleted"
            >
              {{ property.value }}
            </VcProperty>
          </template>

          <VcProperty v-if="vendor" :label="$t('ui_kit.labels.vendor')" :disabled="disabled">
            {{ vendor.name }}
          </VcProperty>

          <VcProperty
            v-if="withPrice && !deleted"
            class="vc-line-item__property-price"
            :label="$t('ui_kit.labels.price_per_item')"
            :disabled="disabled"
          >
            <VcProductPrice :list-price="actualPrice || listPrice" :disabled="disabled" truncate />
          </VcProperty>
        </div>

        <VcProductPrice
          v-if="withPrice"
          class="vc-line-item__price"
          :list-price="listPrice"
          :actual-price="showPlacedPrice ? actualPrice : listPrice"
          :disabled="disabled"
          align="end"
        />

        <div class="vc-line-item__mobile-row" :class="{ 'vc-line-item__mobile-row--empty': !hasMobileRow }">
          <div v-if="withPrice && !deleted" class="vc-line-item__unit-price">
            <span v-if="quantity != null" class="vc-line-item__quantity">
              {{ $t("ui_kit.labels.quantity_times", { quantity: $n(quantity) }) }}
            </span>

            <VcProductPrice
              :list-price="listPrice"
              :actual-price="actualPrice || listPrice"
              :disabled="disabled"
              single-line
            />
          </div>

          <div v-if="$slots.default || $slots.badges" class="vc-line-item__control">
            <div class="vc-line-item__slot">
              <slot />
            </div>

            <div v-if="$slots.badges" class="vc-line-item__badges">
              <slot name="badges" />
            </div>
          </div>

          <div v-if="withTotal" class="vc-line-item__total-row">
            <span class="vc-line-item__total-label">{{ $t("ui_kit.labels.total") }}</span>

            <VcProductPrice
              class="vc-line-item__total"
              :list-price="showPlacedPrice ? total : listTotal"
              :actual-price="total"
              align="end"
              :disabled="disabled"
              truncate
            />
          </div>
        </div>

        <VcButton
          v-if="removable"
          :aria-label="$t('ui_kit.buttons.remove_from_cart')"
          class="vc-line-item__remove-button"
          color="neutral"
          size="sm"
          variant="ghost"
          icon="delete-thin"
          data-test-id="remove-item-button"
          :disabled="disabled"
          @click="$emit('remove')"
        />

        <VcDropdownMenu
          v-if="removable || $slots.menu"
          class="vc-line-item__menu"
          placement="bottom-end"
          :disabled="disabled"
        >
          <template #trigger="{ triggerProps }">
            <VcButton
              :aria-label="$t('ui_kit.labels.actions')"
              :disabled="disabled"
              icon="ellipsis-vertical"
              color="secondary"
              variant="ghost"
              size="xs"
              data-test-id="line-item-menu-button"
              v-bind="triggerProps"
            />
          </template>

          <template #content="{ close }">
            <slot name="menu" :close="close" />

            <VcMenuItem
              v-if="removable"
              color="danger"
              data-test-id="line-item-remove-menu-item"
              nowrap
              @click="
                close();
                $emit('remove');
              "
            >
              <template #prepend>
                <VcIcon name="trash-2" />
              </template>

              <span>{{ $t("ui_kit.buttons.remove_from_cart") }}</span>
            </VcMenuItem>
          </template>
        </VcDropdownMenu>
      </div>
    </div>

    <div v-if="$slots.after" class="vc-line-item__after">
      <slot name="after" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import type { CommonVendor, MoneyType, Property } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "remove"): void;
  (event: "select", value: boolean): void;
  (event: "linkClick"): void;
}

interface IProps {
  imageUrl?: string;
  name: string;
  route?: RouteLocationRaw;
  properties?: Property[];
  listPrice?: MoneyType;
  actualPrice?: MoneyType;
  total?: MoneyType;
  listTotal?: MoneyType;
  selectable?: boolean;
  selected?: boolean;
  removable?: boolean;
  disabled?: boolean;
  deleted?: boolean;
  withImage?: boolean;
  withProperties?: boolean;
  withPrice?: boolean;
  withTotal?: boolean;
  vendor?: CommonVendor;
  browserTarget?: BrowserTargetType;
  showPlacedPrice?: boolean;
  /**
   * Quantity of a read-only line (order, checkout review). In the compact layout the row shows
   * `quantity × price` and the line total instead of the default slot and the "Total" line.
   */
  quantity?: number;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  properties: () => [],
  browserTarget: "_blank",
});

const slots = defineSlots<{
  default?: () => unknown;
  before?: () => unknown;
  after?: () => unknown;
  "after-image"?: () => unknown;
  "after-title"?: () => unknown;
  /** Availability chips. Compact layout: their own line under a dashed rule; wider: under the control. */
  badges?: () => unknown;
  /** Extra `VcMenuItem`s of the compact ⋮ menu, above "Remove"; `close` closes the menu. */
  menu?: (scope: { close: () => void }) => unknown;
}>();

const hasImageContainer = computed(() => !!slots["after-image"] || props.withImage);

const hasFixedQuantity = computed(() => props.quantity != null);

const hasTotalLine = computed(() => props.withTotal && !hasFixedQuantity.value);

const hasMetaLine = computed(() => !!slots.badges || hasTotalLine.value);

const hasMobileRow = computed(
  () => (props.withPrice && !props.deleted) || props.withTotal || !!slots.default || !!slots.badges,
);

const isSelected = ref<boolean>(true);

function changeFocus(event: KeyboardEvent) {
  const { target: targetElement, currentTarget } = event;
  if (!(currentTarget instanceof HTMLElement) || !(targetElement instanceof HTMLElement)) {
    return;
  }
  const targetClassList = targetElement.classList;
  let nextElement: Element | null = null;
  switch (event.key) {
    case "ArrowUp":
      nextElement = currentTarget.previousElementSibling;
      break;
    case "ArrowDown":
      nextElement = currentTarget.nextElementSibling;
      break;
  }
  if (nextElement && nextElement.classList.contains("vc-line-item") && nextElement instanceof HTMLElement) {
    const nextTargetElement = nextElement.querySelector(`.${[...targetClassList].join(".")}`);
    (nextTargetElement as HTMLElement | null)?.focus();
  }
}

watchEffect(() => {
  isSelected.value = props.selected;
});
</script>

<style lang="scss">
.vc-line-item {
  $selected: "";
  $removable: "";
  $removed: "";
  $deleted: "";
  $disabled: "";
  $readonly: "";
  $withMeta: "";
  $withTotal: "";
  $slotEl: "";
  $badgesEl: "";

  --bg-color: var(--color-additional-50);
  --menu-icon-size: var(--vc-line-item-menu-icon-size, 1.25rem);

  @apply relative flex flex-col gap-2 p-3.5 rounded-[--vc-radius] border bg-[--bg-color];

  @container (width > theme("containers.2xl")) {
    @apply p-4 rounded-none border-0 shadow-none;
  }

  &--selected {
    $selected: &;
    --bg-color: var(--color-secondary-50);
  }

  &--removable {
    $removable: &;
  }

  &--deleted {
    $deleted: &;
  }

  &--removed {
    $removed: &;
  }

  &--disabled {
    $disabled: &;
  }

  &--readonly {
    $readonly: &;
  }

  &--with-meta {
    $withMeta: &;
  }

  &--with-total {
    $withTotal: &;
  }

  &__before,
  &__after {
    &:empty {
      @apply hidden;
    }
  }

  &:first-child {
    @container (width > theme("containers.2xl")) {
      @apply rounded-t-[inherit];
    }
  }

  &:last-child {
    @container (width > theme("containers.2xl")) {
      @apply rounded-b-[inherit];
    }
  }

  &__main {
    // Compact (mobile) product row: thumbnail + identity on top, then price and control under a divider.
    @apply grid items-start min-h-[1.25rem];

    grid-template-columns: auto auto minmax(0, 1fr) auto;
    grid-template-areas:
      "check image name  menu"
      "check image props props"
      "row   row   row   row";

    @container (width > theme("containers.2xl")) {
      @apply flex items-center gap-3;
    }
  }

  &__checkbox {
    @apply flex-none me-2.5 mt-4.5;

    grid-area: check;

    @container (width > theme("containers.2xl")) {
      @apply -m-2 p-2;
    }
  }

  &__img-container {
    @apply flex flex-col shrink-0 size-14;

    grid-area: image;

    @container (width <= theme("containers.2xl")) {
      @apply me-3;
    }

    @container (width > theme("containers.2xl")) {
      @apply size-12;
    }

    @container (width > theme("containers.4xl")) {
      @apply size-16;
    }
  }

  &__img {
    @apply shrink-0 size-14 rounded-[--vc-radius] border object-contain object-center;

    @container (width > theme("containers.2xl")) {
      @apply size-12;
    }

    @container (width > theme("containers.4xl")) {
      @apply size-16;
    }

    #{$disabled} &,
    #{$deleted} & {
      @apply opacity-50;
    }
  }

  &__img-actions {
    @container (width > theme("containers.2xl")) {
      @apply hidden;
    }

    #{$deleted} & {
      @apply hidden;
    }
  }

  &__content {
    @apply contents;
  }

  &__name-container {
    @apply flex flex-col;

    grid-area: name;

    @container (width <= theme("containers.2xl")) {
      @apply min-w-0;
    }

    @container (width > theme("containers.2xl")) {
      @apply grow min-h-0;
    }
  }

  &__name {
    @apply text-sm;
  }

  &__name-actions {
    @container (width <= theme("containers.2xl")) {
      @apply hidden;
    }

    #{$deleted} & {
      @apply hidden;
    }
  }

  &__properties {
    @apply flex-none;

    grid-area: props;

    @container (width <= theme("containers.2xl")) {
      --vc-property-columns: auto auto;
      --vc-property-dots-display: none;

      @apply flex min-w-0 flex-wrap gap-x-3 gap-y-0.5 mt-1;
    }

    @container (width > theme("containers.2xl")) {
      @apply mt-0 w-40;
    }

    @container (width > theme("containers.4xl")) {
      @apply w-[11.875rem];
    }

    &--wide {
      @container (width > theme("containers.4xl")) {
        @apply w-[15.5rem];
      }
    }

    &--hide {
      @container (width > theme("containers.4xl")) {
        @apply hidden;
      }
    }
  }

  &__property-price {
    @container (width <= theme("containers.2xl")) {
      @apply hidden;
    }

    @container (width > theme("containers.4xl")) {
      @apply hidden;
    }

    * {
      @apply leading-[inherit] #{!important};
    }
  }

  &__price {
    --vc-product-price-font-size: theme(fontSize.sm);

    @container (width <= theme("containers.4xl")) {
      @apply hidden #{!important};
    }

    @container (width > theme("containers.4xl")) {
      @apply shrink-0 w-[8.25rem];
    }

    #{$deleted} & {
      @container (width > theme("containers.4xl")) {
        @apply invisible;
      }
    }
  }

  &__mobile-row {
    @apply contents;

    // Compact: price | control, then a dashed meta line with availability chips | line total.
    @container (width <= theme("containers.2xl")) {
      @apply grid items-center gap-x-3 mt-3 pt-3 border-t border-neutral-200;

      grid-area: row;
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        "price control"
        "rule rule"
        "badges badges";

      #{$withTotal} & {
        grid-template-areas:
          "price control"
          "rule rule"
          "badges total";
      }

      #{$withMeta} &::after {
        @apply mt-3 border-t border-dashed border-neutral-200;

        content: "";
        grid-area: rule;
      }
    }

    // Nothing to show under the divider (no price, total or slot content): drop the row and its divider.
    &--empty {
      @container (width <= theme("containers.2xl")) {
        @apply hidden;
      }
    }
  }

  &__unit-price {
    --vc-product-price-font-size: theme(fontSize.base);

    @apply flex min-w-0 items-baseline gap-1;

    grid-area: price;

    @container (width > theme("containers.2xl")) {
      @apply hidden;
    }
  }

  &__quantity {
    @apply flex-none text-base font-bold text-neutral-950;
  }

  &__badges {
    $badgesEl: &;

    @apply flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mt-2 empty:hidden;

    // Wider rows: the chips wrap within the control's width instead of widening the column.
    @container (width > theme("containers.2xl")) {
      @apply w-0 min-w-full;
    }

    @container (width <= theme("containers.2xl")) {
      @apply justify-start mt-0 pt-2.5;

      grid-area: badges;
    }
  }

  &__total-row {
    @apply contents;

    @container (width <= theme("containers.2xl")) {
      @apply flex items-baseline justify-end gap-2 pt-2.5;

      grid-area: total;

      #{$readonly} & {
        @apply pt-0;

        grid-area: control;
      }
    }
  }

  &__total-label {
    @apply text-xs font-bold uppercase text-neutral-600;

    @container (width > theme("containers.2xl")) {
      @apply hidden;
    }

    #{$readonly} & {
      @apply hidden;
    }
  }

  &__slot {
    $slotEl: &;

    @apply flex-none empty:hidden;

    @container (width <= theme("containers.2xl")) {
      @apply justify-self-end;

      grid-area: control;

      #{$readonly} & {
        @apply hidden;
      }
    }

    &:has(.vc-add-to-cart--hide-button, * .vc-add-to-cart--hide-button) {
      @apply w-[6.5rem];
    }

    &:has(.vc-quantity-stepper, * .vc-quantity-stepper) {
      @apply w-32;
    }

    &:has(
      .vc-add-to-cart:not(.vc-add-to-cart--hide-button),
      * .vc-add-to-cart:not(.vc-add-to-cart--hide-button),
      .vc-product-button
    ) {
      @apply w-48;

      @container (width > theme("containers.md")) {
        @apply w-72;
      }

      @container (width > theme("containers.2xl")) {
        @apply w-48;
      }

      @container (width > theme("containers.3xl")) {
        @apply w-[15.7rem];
      }
    }

    #{$deleted} & {
      @container (width <= theme("containers.2xl")) {
        @apply hidden;
      }

      @container (width > theme("containers.2xl")) {
        @apply invisible;
      }
    }
  }

  &__control {
    @apply flex flex-none flex-col;

    &:has(> #{$slotEl}:empty):not(:has(> #{$badgesEl})) {
      @apply hidden;
    }

    @container (width <= theme("containers.2xl")) {
      @apply contents;
    }
  }

  &__total {
    --vc-product-price-font-size: theme(fontSize.sm);

    @apply min-w-0;

    #{$readonly} & {
      @container (width <= theme("containers.2xl")) {
        --vc-product-price-font-size: theme(fontSize.base);
      }
    }

    @container (width > theme("containers.2xl")) {
      --vc-product-price-font-size: theme(fontSize.sm);

      @apply shrink-0 w-[6.5rem];
    }

    @container (width > theme("containers.4xl")) {
      --vc-product-price-font-size: theme(fontSize.base);

      @apply w-[8.625rem];
    }
  }

  &__remove-button {
    @apply shrink-0;

    @container (width <= theme("containers.2xl")) {
      @apply hidden;
    }

    @container (width > theme("containers.2xl")) {
      @apply -my-2 -me-2;
    }
  }

  &__menu {
    --vc-button-icon-size: var(--menu-icon-size);

    @apply -mt-1 -me-1.5 ms-2;

    grid-area: menu;

    @container (width > theme("containers.2xl")) {
      @apply hidden;
    }
  }
}
</style>
