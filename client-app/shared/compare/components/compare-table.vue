<template>
  <VcWidget class="compare-table" :shadow="false">
    <template #default-container>
      <!-- Below md, the design moves this block above the header row entirely — teleported
           there (rather than duplicated) so there's one tabs/differ instance and one activeTab. -->
      <div ref="mobileTabsBarRef" class="compare-table__mobile-tabs-bar"></div>

      <div
        ref="headerRowRef"
        class="compare-table__header-row"
        :class="{ 'compare-table__header-row--stuck': isCompact }"
        tabindex="-1"
      >
        <div class="compare-table__controls" :class="{ 'compare-table__controls--stuck': isCompact }">
          <Teleport v-if="mobileTabsBarRef" :to="mobileTabsBarRef" :disabled="!isMobile">
            <div class="compare-table__controls-top">
              <div class="compare-table__tabs">
                <VcTabSwitch
                  :model-value="activeTab"
                  class="compare-table__tab"
                  size="sm"
                  value="all"
                  :label="t('shared.compare.table.tabs.all')"
                  :disabled="isTabSwitchDisabled"
                  @change="activeTab = $event"
                />

                <VcTabSwitch
                  :model-value="activeTab"
                  class="compare-table__tab"
                  size="sm"
                  value="differences"
                  :label="t('shared.compare.table.tabs.differences')"
                  :disabled="isTabSwitchDisabled"
                  @change="activeTab = $event"
                />
              </div>

              <p v-if="!isCompact" class="compare-table__differ">
                {{ t("shared.compare.table.differ_rows", { count: differCount, total: totalRows }) }}
              </p>
            </div>
          </Teleport>

          <VcButton
            v-if="!isCompact"
            class="compare-table__clear-category"
            variant="soft"
            color="neutral"
            size="xs"
            prepend-icon="x"
            @click="emit('clearCategory')"
          >
            {{ t("shared.compare.table.clear_category") }}
          </VcButton>
        </div>

        <table ref="headerScrollRef" class="compare-table__header-scroll">
          <thead class="compare-table__thead">
            <tr class="compare-table__header-inner">
              <th
                v-for="item in products"
                :key="item.entry.localId ?? item.product.id"
                class="compare-table__product"
                :class="{ 'compare-table__product--compact': isCompact }"
                scope="col"
              >
                <template v-if="isCompact">
                  <div class="compare-table__product-summary">
                    <div class="compare-table__product-summary-image-wrap">
                      <VcImage
                        class="compare-table__product-summary-image"
                        :src="item.product.imgSrc"
                        :alt="item.product.name"
                      />
                    </div>

                    <VcProductTitle
                      class="compare-table__product-summary-title"
                      :to="getProductRoute(item.product.id, item.product.slug)"
                      :title="item.product.name"
                      :lines-number="1"
                      @click="emit('selectItem', item.product)"
                    >
                      {{ item.product.name }}
                    </VcProductTitle>
                  </div>

                  <VcButton
                    v-if="item.product.isConfigurable"
                    class="compare-table__product-cart-button"
                    prepend-icon="cube-transparent"
                    size="sm"
                    :to="getConfigurationLink(item)"
                    :target="browserTarget"
                    :aria-label="t('pages.catalog.customize_button')"
                  >
                    <span>
                      {{ t("pages.catalog.customize_button") }}
                    </span>
                  </VcButton>

                  <VcButton
                    v-else-if="item.product.hasVariations"
                    class="compare-table__product-cart-button"
                    prepend-icon="layers"
                    size="sm"
                    :to="getProductRoute(item.product.id, item.product.slug)"
                    :target="browserTarget"
                    :aria-label="t('pages.catalog.variations_button', [(item.product.variations?.length || 0) + 1])"
                  >
                    <span>
                      {{ t("pages.catalog.variations_button", [(item.product.variations?.length || 0) + 1]) }}
                    </span>
                  </VcButton>

                  <VcButton
                    v-else
                    class="compare-table__product-cart-button"
                    prepend-icon="shopping-cart"
                    size="sm"
                    :loading="isAddingToCart(item)"
                    :disabled="isAddToCartDisabled(item.product) || isAddingToCart(item)"
                    :aria-label="t('shared.compare.table.add_to_cart')"
                    @click="onAddToCart(item)"
                  >
                    <span>
                      {{ t("shared.compare.table.add_to_cart") }}
                    </span>
                  </VcButton>
                </template>

                <template v-else>
                  <div class="compare-table__product-image-wrap">
                    <VcImage class="compare-table__product-image" :src="item.product.imgSrc" :alt="item.product.name" />

                    <VcProductActions class="compare-table__product-remove" with-background>
                      <VcProductActionsButton
                        icon="trash-2"
                        :tooltip-text="t('shared.compare.table.remove_product')"
                        @click="emit('removeProduct', item)"
                      />
                    </VcProductActions>
                  </div>

                  <div class="compare-table__product-footer">
                    <VcProductTitle
                      class="compare-table__product-title"
                      :to="getProductRoute(item.product.id, item.product.slug)"
                      :title="item.product.name"
                      :lines-number="2"
                      @click="emit('selectItem', item.product)"
                    >
                      {{ item.product.name }}
                    </VcProductTitle>

                    <VcButton
                      v-if="item.product.isConfigurable"
                      icon="cube-transparent"
                      size="sm"
                      :to="getConfigurationLink(item)"
                      :target="browserTarget"
                      :aria-label="t('pages.catalog.customize_button')"
                    />

                    <VcButton
                      v-else-if="item.product.hasVariations"
                      icon="layers"
                      size="sm"
                      :to="getProductRoute(item.product.id, item.product.slug)"
                      :target="browserTarget"
                      :aria-label="t('pages.catalog.variations_button', [(item.product.variations?.length || 0) + 1])"
                    />

                    <VcButton
                      v-else
                      icon="shopping-cart"
                      size="sm"
                      :loading="isAddingToCart(item)"
                      :disabled="isAddToCartDisabled(item.product) || isAddingToCart(item)"
                      :aria-label="t('shared.compare.table.add_to_cart')"
                      @click="onAddToCart(item)"
                    />
                  </div>
                </template>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <table ref="bodyScrollRef" class="compare-table__scroll">
        <tbody class="compare-table__tbody">
          <tr
            v-for="(row, index) in visibleRows"
            :key="row.key"
            class="compare-table__row"
            :class="{ 'compare-table__row--alt': index % 2 === 1 }"
          >
            <th class="compare-table__row-label" scope="row">
              <span class="compare-table__row-label-info-wrap">
                <span class="compare-table__row-label-text">{{ row.label }}</span>

                <VcTooltip
                  v-if="row.description"
                  class="compare-table__row-info"
                  placement="top"
                  strategy="fixed"
                  enable-teleport
                >
                  <template #trigger>
                    <VcIcon name="information-circle" size="xs" :label="row.description" />
                  </template>

                  <template #content>
                    {{ row.description }}
                  </template>
                </VcTooltip>
              </span>

              <VcButton
                class="compare-table__row-pin"
                :class="{ 'compare-table__row-pin--active': isRowPinned(row.key) }"
                size="xxs"
                variant="ghost"
                :color="isRowPinned(row.key) ? 'secondary' : 'neutral'"
                icon
                :aria-pressed="isRowPinned(row.key)"
                :aria-label="
                  t(
                    isRowPinned(row.key)
                      ? 'shared.compare.table.pin.unpin_label'
                      : 'shared.compare.table.pin.pin_label',
                    { label: row.label },
                  )
                "
                :title="
                  t(
                    isRowPinned(row.key)
                      ? 'shared.compare.table.pin.unpin_title'
                      : 'shared.compare.table.pin.pin_title',
                  )
                "
                @click="togglePin(row.key)"
              >
                <VcIcon name="pin" :variant="isRowPinned(row.key) ? 'solid' : 'outline'" />
              </VcButton>
            </th>

            <td
              v-for="(value, index) in row.values"
              :key="products[index]?.entry.localId ?? products[index]?.product.id ?? index"
              class="compare-table__row-value"
            >
              <VcProductPrice
                v-if="row.kind === 'price' && products[index]"
                class="compare-table__price"
                align="start"
                single-line
                :actual-price="getDisplayPrice(products[index]!.product).actual"
                :list-price="getDisplayPrice(products[index]!.product).list"
                :with-from-label="
                  products[index]!.product.hasVariations ||
                  (products[index]!.product.isConfigurable && !products[index]!.entry.configurationSectionInput?.length)
                "
              />

              <span v-else-if="row.kind === 'rating' && products[index]?.product.rating" class="compare-table__rating">
                <VcRating
                  mode="full"
                  read-only
                  :value="products[index]!.product.rating!.value"
                  size="xs"
                  :with-text="false"
                />
                {{ value }}
              </span>

              <InStock
                v-else-if="row.kind === 'availability' && products[index]"
                :is-in-stock="products[index]!.product.availabilityData.isInStock"
                :is-available="products[index]!.product.availabilityData.isAvailable"
                :is-digital="products[index]!.product.productType === ProductType.Digital"
                :quantity="products[index]!.product.availabilityData.availableQuantity"
              />

              <span
                v-else-if="row.kind === 'boolean' && row.boolValues?.[index] !== undefined"
                class="compare-table__boolean"
              >
                <VcIcon
                  size="sm"
                  :name="row.boolValues[index] ? 'check' : 'x'"
                  :class="row.boolValues[index] ? 'text-success' : 'text-neutral-400'"
                />

                {{ value }}
              </span>

              <template v-else>{{ value }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints, useCssVar, useElementBounding } from "@vueuse/core";
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBrowserTarget } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { getProductRoute } from "@/core/utilities";
import { useHorizontalScrollSync } from "@/ui-kit/composables";
import { BREAKPOINTS } from "@/ui-kit/constants";
import { useCompareAddToCart, useCompareTableRowPins } from "../composables";
import { AVAILABILITY_ROW_KEY, PRICE_ROW_KEY } from "../constants";
import { getConfigurationLink, getDisplayPrice } from "../utilities";
import type { ICompareDisplayProduct, ICompareTableRow } from "../types";
import type { Product } from "@/core/api/graphql/types";
import InStock from "@/shared/catalog/components/in-stock.vue";

interface IEmits {
  (e: "clearCategory"): void;
  (e: "removeProduct", item: ICompareDisplayProduct): void;
  (e: "selectItem", product: Product): void;
}

interface IProps {
  products: ICompareDisplayProduct[];
  rows?: ICompareTableRow[];
  differCount?: number;
  totalRows?: number;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  rows: () => [],
  differCount: 0,
  totalRows: 0,
});

// Always shown even under the "Differences" filter, regardless of row.differs.
const PERMANENT_ROW_KEYS = [PRICE_ROW_KEY, AVAILABILITY_ROW_KEY];

const { t } = useI18n();
const { browserTarget } = useBrowserTarget();
const { isAddingToCart, isAddToCartDisabled, onAddToCart } = useCompareAddToCart();

// Below md the tabs/differ block is teleported above the header row (see the design) instead of
// being duplicated in two places with two templates to keep in sync.
const isMobile = useBreakpoints(BREAKPOINTS).smaller("md");

const { isRowPinned, togglePin, pinnedRows, unpinnedRows } = useCompareTableRowPins(() => props.rows);

const activeTab = ref("all");
const bodyScrollRef = ref<HTMLElement | null>(null);
const headerScrollRef = ref<HTMLElement | null>(null);
const mobileTabsBarRef = ref<HTMLElement | null>(null);
const headerRowRef = ref<HTMLElement | null>(null);

// Kept live by VcHeader/MobileHeader — the app header's exact current height (it's shorter on
// mobile), so the table's own header row can stick flush below it instead of under/away from it.
const appHeaderHeightVar = useCssVar("--vc-app-header-height", undefined, { observe: true });
const appHeaderHeight = computed(() => Number.parseFloat(appHeaderHeightVar.value ?? "0") || 0);

// `top` below mirrors appHeaderHeight (see style block), so once the row's own top has scrolled
// up to meet it, position: sticky has pinned the row in place — that's what "compact" reacts to.
// Below md the row still sticks, but always in its full (non-compact) layout — there's no
// space to gain from compacting it there since it's already the single-column mobile layout.
const { top: headerRowTop, update: updateHeaderRowBounding } = useElementBounding(headerRowRef);
const isCompact = computed(() => !isMobile.value && headerRowTop.value <= appHeaderHeight.value + 1);

watch(appHeaderHeight, () => updateHeaderRowBounding());

// isCompact flipping swaps entire v-if/v-else subtrees (the clear-category button, and each
// product's compact-vs-full cell) rather than patching them in place, so Vue destroys whatever
// held focus. Left alone, focus falls through to <body>, stranding keyboard users. Move it to
// the stable header row itself (tabindex="-1" in the template) instead.
watch(isCompact, async () => {
  const previouslyFocused = document.activeElement;

  if (!headerRowRef.value?.contains(previouslyFocused)) {
    return;
  }

  await nextTick();

  if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
    return;
  }

  headerRowRef.value?.focus();
});

const isTabSwitchDisabled = computed(() => props.products.length <= 1);

const visibleRows = computed(() => {
  const rest =
    activeTab.value === "differences"
      ? unpinnedRows.value.filter((row) => row.differs || PERMANENT_ROW_KEYS.includes(row.key))
      : unpinnedRows.value;

  return [...pinnedRows.value, ...rest];
});

useHorizontalScrollSync(bodyScrollRef, headerScrollRef);

watch(
  isTabSwitchDisabled,
  (disabled) => {
    if (disabled) {
      activeTab.value = "all";
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.compare-table {
  &__scroll {
    @apply block overflow-x-auto rounded-b-[--vc-radius];
  }

  &__tbody {
    @apply block;
  }

  &__header-row {
    @apply sticky z-10 flex overflow-hidden rounded-t-[--vc-radius] border-b border-neutral-200 bg-additional-50;

    // Sits flush below the app header (shorter on mobile — see vc-header.vue/mobile-header.vue,
    // which keep this var updated with the header's live, current height).
    top: var(--vc-app-header-height, 0px);

    @media (width < theme("screens.md")) {
      @apply rounded-t-none;
    }

    &--stuck {
      @apply shadow-md;
    }
  }

  &__mobile-tabs-bar {
    @apply hidden;

    @media (width < theme("screens.md")) {
      @apply flex rounded-t-[--vc-radius] border-b border-neutral-200 bg-additional-50 px-3 py-2.5;
    }
  }

  &__header-scroll {
    @apply block min-w-0 flex-1 overflow-x-auto;

    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__thead {
    @apply block;
  }

  &__header-inner {
    @apply flex items-stretch;
  }

  &__controls {
    @apply flex w-60 shrink-0 flex-col justify-between gap-3 border-e border-neutral-200 py-3 pe-4 ps-3;

    @media (width < theme("screens.md")) {
      @apply w-28;
    }

    &--stuck {
      @apply justify-center;
    }
  }

  &__controls-top {
    @apply flex flex-col gap-3;

    @media (width < theme("screens.md")) {
      @apply w-full flex-row items-center justify-between gap-3;
    }
  }

  &__clear-category {
    @apply self-start;

    @media (width < theme("screens.md")) {
      @apply hidden;
    }
  }

  &__tabs {
    @apply grid grid-cols-2 gap-0.5 rounded-[--vc-radius] bg-neutral-100 p-1.5;
  }

  &__tab {
    @apply w-full;

    --vc-tab-switch-border-color: transparent;
  }

  &__differ {
    @apply text-xs text-neutral-500;
  }

  &__product {
    @apply flex min-w-48 max-w-60 flex-1 flex-col gap-3 p-3 text-start font-normal;

    @media (width < theme("screens.md")) {
      @apply w-28 min-w-0 max-w-none flex-none;
    }

    &:not(:last-child) {
      @apply border-e border-neutral-200;
    }

    &--compact {
      @apply justify-between gap-2 py-2.5;
    }
  }

  &__product-image-wrap {
    @apply relative h-44 overflow-hidden rounded-[--vc-radius] border border-neutral-300;

    @media (width < theme("screens.md")) {
      @apply h-24;
    }
  }

  &__product-image {
    @apply size-full object-cover;
  }

  &__product-remove {
    @apply absolute end-1 top-1;
  }

  &__product-footer {
    @apply flex items-end gap-2;

    @media (width < theme("screens.md")) {
      @apply flex-col items-start;
    }
  }

  &__product-title {
    --vc-product-title-font-size: theme("fontSize.sm");

    @apply min-w-0 flex-1;
  }

  &__product-summary {
    @apply flex items-center gap-2.5;
  }

  &__product-summary-image-wrap {
    @apply size-10 shrink-0 overflow-hidden rounded-[--vc-radius] border border-neutral-300;
  }

  &__product-summary-image {
    @apply size-full object-cover;
  }

  &__product-summary-title {
    --vc-product-title-font-size: theme("fontSize.sm");

    @apply min-w-0 flex-1;
  }

  &__product-cart-button {
    @apply w-full;
  }

  &__row {
    @apply flex min-h-[50px] w-fit min-w-full items-stretch;

    &:not(:last-child) {
      @apply border-b border-neutral-200;
    }

    &:hover {
      @apply bg-secondary-100;

      .compare-table__row-pin {
        @apply opacity-100;
      }

      .compare-table__row-label {
        @apply bg-secondary-100;
      }
    }
  }

  &__row--alt {
    @apply bg-neutral-50;

    .compare-table__row-label {
      @apply bg-neutral-50;
    }
  }

  &__row-label {
    @apply sticky start-0 z-[1] flex w-60 shrink-0 items-center gap-1 border-e border-neutral-200 bg-additional-50 px-3 py-2.5 text-start text-xs font-normal text-neutral-600;

    @media (width < theme("screens.md")) {
      @apply w-28;
    }
  }

  &__row-label-info-wrap {
    @apply flex min-w-0 flex-1 items-center gap-1.5;
  }

  &__row-label-text {
    @apply min-w-0 truncate;
  }

  &__row-info {
    @apply shrink-0 text-neutral-500;

    @media (width < theme("screens.md")) {
      @apply hidden;
    }
  }

  &__row-pin {
    @apply shrink-0 opacity-0 transition-opacity;

    @media (width < theme("screens.md")) {
      @apply hidden;
    }

    @media (hover: none) {
      @apply opacity-100;
    }

    &:focus-visible {
      @apply opacity-100;
    }

    &--active {
      @apply opacity-100;
    }
  }

  &__row-value {
    @apply flex min-w-48 max-w-60 flex-1 items-center break-words px-3 py-2.5 text-sm font-normal text-neutral-900;

    @media (width < theme("screens.md")) {
      @apply w-28 min-w-0 max-w-none flex-none;
    }

    &:not(:last-child) {
      @apply border-e border-neutral-200;
    }
  }

  &__price {
    --vc-product-price-font-size: theme("fontSize.sm");
  }

  &__rating {
    @apply flex items-center gap-2 text-sm font-bold;
  }

  &__boolean {
    @apply flex items-center gap-2;
  }
}
</style>
