<template>
  <VcProductCard
    :view-mode="viewMode"
    :data-product-sku="product.code"
    border
    ref="productCard"
    :class="['product-card', `product-card--${viewMode}`]"
  >
    <template #media>
      <VcProductImage
        :images="viewMode === 'grid' ? product.images : []"
        :img-src="product.imgSrc"
        :alt="product.name"
        :lazy="lazy"
        :to="link"
      >
        <BadgesWrapper>
          <PurchasedBeforeBadge v-if="product.isPurchased" :size="badgeSize" square />

          <DiscountBadge v-if="product.price" static :price="product.price" :size="badgeSize" />
        </BadgesWrapper>
      </VcProductImage>

      <VcProductActions :direction="viewMode === 'grid' ? 'vertical' : 'horizontal'">
        <AddToList :product="product" />

        <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="product" />
      </VcProductActions>
    </template>

    <!-- Always there in the grid, empty or not, so the titles of a row stand on one line. -->
    <VcProductVendor v-if="viewMode === 'grid' || maker || product.hasVariations || product.isConfigurable">
      <span v-if="maker" class="product-card__maker">{{ maker }}</span>

      <!-- Said up front, because a product with variations is bought differently: it opens a choice
           rather than going straight into the cart. -->
      <VcBadge
        v-if="product.hasVariations"
        variant="soft"
        color="success"
        size="sm"
        rounded
        class="product-card__variants"
      >
        {{ $t("shared.catalog.product_card.variants") }}
      </VcBadge>

      <VcBadge
        v-else-if="product.isConfigurable"
        variant="soft"
        color="info"
        size="sm"
        rounded
        class="product-card__variants"
      >
        {{ $t("shared.catalog.product_card.configurable") }}
      </VcBadge>
    </VcProductVendor>

    <VcProductTitle
      :title="product.name"
      :to="link"
      lines-number="2"
      fix-height
      @click="$emit('linkClick', product, $event)"
    />

    <VcProductProperties v-if="cardType !== 'short' && (viewMode === 'grid' || properties.length)">
      <span v-for="(property, i) in properties" :key="i" class="product-card__spec">
        <b class="product-card__spec-label">{{ property.label }}</b>
        {{ " " }}
        <span class="product-card__spec-value">{{ property.value }}</span>
      </span>
    </VcProductProperties>

    <VcProductPrice
      :actual-price="actualPrice"
      :list-price="listPrice"
      :with-from-label="product.hasVariations"
      :single-line="viewMode === 'grid'"
    />

    <ExtensionPoint
      v-if="$canRenderExtensionPoint('productCard', EXTENSION_NAMES.productCard.cardButton, product)"
      :name="EXTENSION_NAMES.productCard.cardButton"
      category="productCard"
      :product="product"
      is-text-shown
    />

    <VcProductButton
      v-else-if="product.isConfigurable"
      variant="outline"
      color="primary"
      data-test-id="product-card-configurations-button"
      :to="link"
      :link-text="$t('pages.catalog.customize_button')"
      :link-to="link"
      :button-text="$t('pages.catalog.customize_button')"
      icon="cube-transparent"
      :target="browserTarget || browserTargetFromSetting"
      @link-click="$emit('linkClick', product, $event)"
    />

    <template v-else-if="product.hasVariations">
      <VcProductButton
        variant="outline"
        color="secondary"
        class="product-card__variations-button"
        :data-test-id="`variations-${product.code}-button`"
        :link-text="$t('pages.catalog.show_on_a_separate_page')"
        :link-to="link"
        :button-text="$t('pages.catalog.variations_button', [variationsCount])"
        :append-icon="isExpanded ? 'chevron-up' : 'chevron-down'"
        :loading="fetchingVariations"
        @link-click="handleVariationsClick"
      />

      <VcProductButton
        variant="outline"
        color="secondary"
        class="product-card__variations-link-button"
        :data-test-id="`variations-${product.code}-button`"
        :to="link"
        :link-text="$t('pages.catalog.show_on_a_separate_page')"
        :link-to="link"
        :button-text="$t('pages.catalog.variations_button', [variationsCount])"
        :target="browserTarget || browserTargetFromSetting"
        @link-click="$emit('linkClick', product, $event)"
      />
    </template>

    <AddToCartSimple v-else :product="product">
      <template v-if="viewMode !== 'list'">
        <InStock
          labeled
          :is-in-stock="product.availabilityData?.isInStock"
          :is-digital="product.productType === ProductType.Digital"
          :quantity="product.availabilityData?.availableQuantity"
        />

        <CountInCart :product-id="product.id" :currency="product.price.currency" />
      </template>
    </AddToCartSimple>

    <!-- In the list the stock is a column of its own — AVAILABILITY — rather than a line under the
         stepper, and it is there for every product, including those bought through variations. -->
    <div v-if="viewMode === 'list'" class="product-card__stock">
      <InStock
        labeled
        :is-in-stock="product.availabilityData?.isInStock"
        :is-digital="product.productType === ProductType.Digital"
        :quantity="product.availabilityData?.availableQuantity"
      />

      <CountInCart :product-id="product.id" :currency="product.price.currency" />
    </div>

    <template v-if="viewMode === 'list'" #expanded-content>
      <div v-show="isExpanded" class="product-card__variants-wrapper">
        <div
          v-if="fetchingVariations && (!variations || variations.length === 0)"
          class="product-card__variants-loader"
        >
          <VcLoader />
        </div>

        <template v-else>
          <VcTypography tag="h5" class="product-card__variants-title" text-transform="none">
            {{ $t("pages.catalog.available_variations", variationsCount) }}
          </VcTypography>

          <VariationsDefault
            :variations="variations ?? []"
            :page-number="variationsPageNumber"
            :pages-count="variationsPagesCount"
            @change-page="changeVariationsPage"
          />
        </template>
      </div>
    </template>
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, useTemplateRef, watch } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { useBrowserTarget, useThemeContext } from "@/core/composables";
import { BrowserTargetType, ProductType } from "@/core/enums";
import { getProductRoute, getPropertiesGroupedByName } from "@/core/utilities";
import { useCatalogBasePath } from "@/shared/catalog/composables/useCatalogBasePath";
import { useProductVariations } from "@/shared/catalog/composables/useProductVariations";
import { useProducts } from "@/shared/catalog/composables/useProducts";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME } from "@/shared/catalog/constants/product";
import { EXTENSION_NAMES } from "@/shared/common/constants";
import { AddToCompareCatalog } from "@/shared/compare/components";
import { AddToList } from "@/shared/wishlists";
import BadgesWrapper from "./badges-wrapper.vue";
import CountInCart from "./count-in-cart.vue";
import DiscountBadge from "./discount-badge.vue";
import InStock from "./in-stock.vue";
import VariationsDefault from "./product/variations-default.vue";
import PurchasedBeforeBadge from "./purchased-before-badge.vue";
import type { Product } from "@/core/api/graphql/types";
import AddToCartSimple from "@/shared/cart/components/add-to-cart-simple.vue";

interface IEmits {
  (eventName: "linkClick", product: Product, globalEvent: MouseEvent): void;
}

interface IProps {
  loading?: boolean;
  product: Product;
  viewMode?: "grid" | "list";
  browserTarget?: BrowserTargetType;
  cardType?: "full" | "short";
  lazy?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  viewMode: "grid",
  browserTarget: BrowserTargetType.BLANK,
});

const product = toRef(props, "product");
const isExpanded = ref(false);
const productCard = useTemplateRef("productCard");

const { browserTarget: browserTargetFromSetting } = useBrowserTarget();
const { themeContext } = useThemeContext();

const productId = computed(() => product.value.id);

const catalogBasePath = useCatalogBasePath();
const link = computed(() => getProductRoute(productId.value, props.product.slug, catalogBasePath.value));

const actualPrice = computed(() =>
  product.value.hasVariations
    ? (product.value.minVariationPrice?.actual ?? product.value.price.actual)
    : product.value.price.actual,
);
const listPrice = computed(() =>
  product.value.hasVariations
    ? (product.value.minVariationPrice?.list ?? product.value.price.list)
    : product.value.price.list,
);

/** The property a catalog carries its brand in, when the brand is not a vendor record. */
const BRAND_PROPERTY_NAME = "brand";

const productProperties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product)).filter(
    (property) => property.name !== PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME,
  ),
);

const isBrandProperty = (name?: string) => name?.toLowerCase() === BRAND_PROPERTY_NAME;

/**
 * Who makes it, shown over the title. A marketplace names the vendor; a catalog without vendors
 * usually keeps the brand as an ordinary property, and QA's does. Either way it is one name, and
 * showing it again as a chip would spend one of the card's two chips on what the eyebrow already said.
 */
const maker = computed(
  () =>
    (themeContext.value?.settings?.vendor_enabled && props.product.vendor?.name) ||
    productProperties.value.find((property) => isBrandProperty(property.name))?.value ||
    undefined,
);

const properties = computed(() =>
  productProperties.value
    .filter((property) => !isBrandProperty(property.name))
    // Two, as the design has it: a third row turns the card into a table of attributes, and the
    // grid is scanned for the product, not read for its specification.
    .slice(0, 2),
);

const badgeSize = computed(() => {
  return props.viewMode === "grid" ? "md" : "sm";
});

const {
  products: variations,
  pagesCount: variationsPagesCount,
  productsFilters,
  fetchingProducts: fetchingVariations,
  fetchProducts: fetchVariationsProducts,
} = useProducts({
  initialFetchingState: false,
});

const variationsLoaded = ref(false);

// The grid keys its cards by seat so a card can turn without being replaced, which means this
// component outlives the product it was opened on. Nothing it worked out about the last one holds.
watch(productId, () => {
  isExpanded.value = false;
  variationsLoaded.value = false;
});

const variationsFilterExpression = computed(() => `productfamilyid:${productId.value} is:product,variation`);

const { variationsSearchParams, updateSearchParams } = useProductVariations({
  productsFilters,
  variationsFilterExpression,
});

const variationsPageNumber = computed(() => variationsSearchParams.value.page ?? 1);

async function loadVariations() {
  if (!variationsLoaded.value) {
    await fetchVariationsProducts(variationsSearchParams.value);
    variationsLoaded.value = true;
  }
}

async function changeVariationsPage(pageNumber: number) {
  updateSearchParams({ page: pageNumber });
  await fetchVariationsProducts(variationsSearchParams.value);
}

async function handleVariationsClick() {
  isExpanded.value = !isExpanded.value;

  if (isExpanded.value && !variationsLoaded.value) {
    await loadVariations();
  }

  if (isExpanded.value) {
    await nextTick();
    const cardElement = productCard.value?.$el as HTMLElement | null;
    if (cardElement) {
      const headerHeightVar = getComputedStyle(document.documentElement).getPropertyValue(
        "--vc-layout-sidebar-offset-top",
      );
      const headerHeight = headerHeightVar ? parseInt(headerHeightVar, 10) : 0;

      const elementPosition = cardElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }
}

const variationsCount = computed(() => {
  if (!productsFilters.value.inStock) {
    return (props.product.variations?.length || 0) + 1;
  }

  let result = 0;
  if (props.product.availabilityData?.isInStock && props.product.availabilityData.isBuyable) {
    result++;
  }
  result +=
    props.product.variations?.filter((x) => x.availabilityData?.isInStock && x.availabilityData?.isBuyable)?.length ||
    0;

  return result;
});
</script>

<style scoped lang="scss">
.product-card {
  // The card lies flat on the plate and lifts only under the pointer: a warm shadow off the brown,
  // not the kit's grey one, easing in with the border.
  @apply shadow-none;

  transition:
    box-shadow 0.22s ease,
    border-color 0.22s ease;

  &:hover {
    box-shadow:
      0 1px 3px rgb(from theme("colors.secondary.500") r g b / 0.16),
      0 4px 16px rgb(from theme("colors.secondary.500") r g b / 0.28);
  }

  // Dark has no warm shadow to spend: the lift is the theme's darkest step, off the neutral ramp the
  // preset inverts (its additional pair flips to the light end).
  html.dark &:hover {
    box-shadow:
      0 2px 6px rgb(from theme("colors.neutral.50") r g b / 0.45),
      0 10px 28px rgb(from theme("colors.neutral.50") r g b / 0.5);
  }

  // The brand reads as an eyebrow over the title: it is what the eye lands on first when scanning a
  // grid of products it does not yet know.
  :deep(.vc-product-vendor) {
    @apply flex items-center gap-2 font-bold uppercase text-neutral-500;

    // The kit orders everything in the card through one sequence, media included — the photo, then
    // the title at 2. The brand shares the title's step and comes first in the markup, so it sits
    // between the two instead of above the photo.
    order: 2;
  }

  &__maker {
    @apply truncate;
  }

  &__variants {
    @apply shrink-0 text-[0.6875rem] font-bold uppercase tracking-[0.08em];
  }

  // The specification as chips rather than a two-column table with dotted leaders: on a card the
  // pair is scanned, not read across. At most two, side by side, wrapping when they do not fit.
  :deep(.vc-product-properties) {
    @apply flex flex-row flex-wrap content-start gap-[0.3125rem];
  }

  &__spec {
    @apply min-w-0 max-w-full truncate rounded-lg border border-neutral-100 bg-neutral-100 px-2 py-0.5 text-[0.71875rem] leading-[1.45] text-neutral-700;
  }

  &__spec-label {
    @apply font-semibold text-neutral-950;
  }

  // In dark the neutral 100 step is the card itself, and a flat chip would vanish into it: it lifts
  // off with a wash of the ink instead.
  // Packshots are shot on white; in dark the photo and its plate are knocked back together, so a
  // grid of tiles stops glaring without a seam opening between the two.
  html.dark & :deep(.vc-product-image) {
    filter: brightness(0.94);
  }

  html.dark &__spec {
    background: rgb(from theme("colors.neutral.950") r g b / 0.06);
    border-color: rgb(from theme("colors.neutral.950") r g b / 0.09);
  }

  // The stock chip's glyph at 14px: the kit's small chip draws a 10px one, which beside a sentence
  // rather than a bare number read as a speck. The chip rebuilds its glyph size from its own
  // `--icon-size` on the content, so that is the knob.
  :deep(.vc-quantity-stepper__badges .vc-chip),
  :deep(.product-card__stock .vc-chip) {
    --icon-size: 0.875rem;
  }

  // The quick actions come out on hover and on keyboard focus, and stay out where there is no hover
  // to reveal them — on a touch screen a hidden control is a missing one.
  :deep(.vc-product-actions) {
    @apply transition-opacity duration-150;

    @media (hover: hover) {
      @apply opacity-0;
    }
  }

  &:hover,
  &:focus-within {
    :deep(.vc-product-actions) {
      @apply opacity-100;
    }
  }

  // Grid, after the design's card: a thin 8px plate with the photo flush to it and only the column
  // of type inset a further 10, the brand over the title, chips, and the quick actions as glass
  // circles on the photo. Written two classes deep: the kit sizes the title and price through
  // `.vc-product-card > wrapper` selectors of the same weight as a one-class rule here, and it
  // loads later.
  &.product-card--grid {
    @apply border-neutral-200;

    :deep(.vc-product-card__wrapper) {
      @apply px-2 pb-4 pt-2;
    }

    :deep(.vc-product-vendor),
    :deep(.vc-product-title),
    :deep(.vc-product-properties),
    :deep(.vc-product-price),
    :deep(.vc-quantity-stepper),
    :deep(.vc-product-button) {
      @apply px-2.5;
    }

    :deep(.vc-product-vendor) {
      @apply mt-3 h-[1.125rem] text-[0.71875rem] leading-[1.4] tracking-[0.08em];
    }

    :deep(.vc-product-title) {
      --vc-product-title-font-size: 0.90625rem;
      --vc-product-title-link-color: theme("colors.neutral.950");
      --vc-product-title-link-hover-color: theme("colors.accent.600");

      @apply mt-1.5 h-[2.64em] font-geologica text-[0.90625rem] font-semibold tracking-[-0.008em];
    }

    // The kit pins the title's own line-height; the text inside it takes the design's.
    :deep(.vc-product-title__text) {
      @apply leading-[1.32];
    }

    // Room for two rows of chips. The design writes 49, but its own chip is 22.675 tall and two rows
    // with the 5px gap come to 50.35 — at 49 a card with two rows sits 1.35px lower than its neighbours.
    :deep(.vc-product-properties) {
      @apply mt-2 min-h-[3.1469rem];
    }

    // The design keeps one rhythm from the top — every block holds its height, chips included — so
    // the prices of a row stand on one line. The kit's spacer instead pushes the bottom block down to
    // the card's foot, and a variations button taller than a stepper then lifts its price by 14px.
    :deep(.vc-product-card__expander) {
      @apply hidden;
    }

    :deep(.vc-product-price) {
      --vc-product-price-font-size: 1.1875rem;

      @apply mt-2.5 font-geologica tracking-[-0.02em];
    }

    :deep(.vc-product-price__actual) {
      @apply font-bold;
    }

    :deep(.vc-product-price__list) {
      @apply text-sm font-normal tracking-normal;
    }

    :deep(.vc-quantity-stepper),
    :deep(.vc-product-button) {
      @apply mt-2.5;
    }

    // The line under the button, close under it as the design sets it: 8 below "Customize", bold with
    // a 16px glyph; 6 below "N variations", regular with a 12px one.
    :deep(.vc-product-button__link) {
      @apply mt-2 gap-1.5 leading-4;
    }

    .product-card__variations-link-button :deep(.vc-product-button__link) {
      --vc-icon-size: 0.75rem;

      @apply mt-1.5 gap-1 font-normal;
    }

    :deep(.vc-quantity-stepper__badges) {
      @apply mt-1.5 min-h-[1.375rem];
    }

    // The photo is a white plate with a hairline, the colour its packshots are shot on.
    :deep(.vc-product-image) {
      @apply aspect-square h-auto rounded-[0.625rem] border border-neutral-100 bg-additional-50;
    }

    :deep(.vc-product-image__img),
    :deep(.vc-product-image__carousel-img) {
      @apply p-2;
    }

    // The badges and the quick actions belong to the photo: 8 of card plus 8 inside it. The kit
    // cuts the badges a notch out of the photo instead — a white corner with rounded ears.
    :deep(.badges-wrapper) {
      @apply start-2 top-2 bg-transparent p-0;

      &::before,
      &::after {
        @apply hidden;
      }
    }

    :deep(.vc-product-actions) {
      @apply end-2 top-2 gap-1.5 bg-transparent p-0;
    }

    // Each action is a 30px circle of frosted white with a warm brown glyph that turns the brand
    // orange under the pointer and once picked.
    :deep(.vc-product-actions-button) {
      --vc-icon-size: 1rem;

      @apply size-[1.875rem] rounded-full p-0 text-secondary-600;

      background: rgb(from theme("colors.additional.50") r g b / 0.9);
      backdrop-filter: blur(28px) saturate(180%) brightness(1.08) contrast(1.05);
      box-shadow:
        inset 0 0 0 1px rgb(from theme("colors.additional.50") r g b / 0.6),
        inset 0 1px 1px rgb(from theme("colors.additional.50") r g b / 0.85),
        inset 0 -1px 2px rgb(from theme("colors.neutral.950") r g b / 0.06);
      transition:
        background 0.18s ease,
        color 0.18s ease,
        transform 0.12s ease;

      &:hover,
      &.vc-product-actions-button--active {
        @apply text-primary-500;
      }

      &:active {
        @apply scale-90;
      }
    }
  }

  // List: the design's catalog row — photo · product · availability · unit price · add to cart ·
  // actions — on the kit's own grid areas, so no kit component is touched. The columns come from
  // --product-list-columns, which the grid also hands the column heading above the rows: the two
  // cannot drift apart when one is edited.
  &.product-card--list {
    @apply rounded-xl border border-neutral-100;

    &:hover {
      @apply shadow-md;
    }

    --vc-product-title-font-size: 0.9375rem;

    :deep(.vc-product-card__wrapper) {
      @apply items-center gap-x-3 gap-y-1 px-4 py-3;

      // Narrow, as the design has it below a 60rem container: no columns and no heading — photo
      // beside the product, the stock as a full-width line with a rule under it, then the price and
      // the stepper on one line. Every cell the row carries has a place, so none falls into a
      // leftover track.
      grid-template-areas:
        "image vendor     vendor      vendor"
        "image title      title       title"
        "image properties properties  properties"
        "stock stock      stock       stock"
        "price price      add-to-cart actions";
      grid-template-columns: 5rem minmax(0, 1fr) minmax(9.375rem, 13.75rem) auto;
      grid-template-rows: auto;
      column-gap: 0.875rem;
      row-gap: 0.625rem;

      // Below 34rem the photo goes and the product takes the width. The design's bottom line is a
      // wrapping flex, and at a phone's width it wraps: the price above, the stepper and the actions
      // below — side by side they need 360px of a 300px row.
      @container (width < 34rem) {
        grid-template-areas:
          "vendor      vendor"
          "title       title"
          "properties  properties"
          "stock       stock"
          "price       price"
          "add-to-cart actions";
        grid-template-columns: minmax(0, 1fr) auto;
      }

      @container (min-width: 60rem) {
        grid-template-areas:
          "image vendor     stock price add-to-cart actions"
          "image title      stock price add-to-cart actions"
          "image properties stock price add-to-cart actions";
        grid-template-columns: var(--product-list-columns);
        grid-template-rows: auto auto auto;
        column-gap: 0.75rem;
      }
    }

    // The kit keeps the photo and the actions in one media box, which the row's areas have no place
    // for: auto-placed, it opened an extra column on the right that ate the row's width and dropped
    // the actions onto a line of their own. Unboxed, each goes to its own area.
    :deep(.vc-product-card__media) {
      display: contents;
    }

    :deep(.vc-product-image) {
      grid-area: image;

      // 80 in a 72 track: it runs 8 into the gap, as the design has it, or the photo reads smaller
      // than the caption beside it.
      @apply size-20 max-w-none rounded-[0.625rem] border border-neutral-200 bg-additional-50;
    }

    :deep(.vc-product-image__img) {
      @apply p-1.5;
    }

    :deep(.badges-wrapper) {
      @apply start-1 top-1 bg-transparent p-0;

      &::before,
      &::after {
        @apply hidden;
      }
    }

    :deep(.vc-product-vendor) {
      @apply mt-0 self-end text-[0.6875rem] tracking-[0.06em];
    }

    // In the row the name is a link again, in the kit's link blue: the row is read across to the
    // product, not scanned for what a thing is.
    :deep(.vc-product-title) {
      @apply mt-0 self-center text-[0.9375rem] font-bold;
    }

    :deep(.vc-product-title__text) {
      @apply leading-[1.125rem];
    }

    :deep(.vc-product-properties) {
      grid-area: properties;

      @apply m-0 w-auto flex-row flex-wrap self-start;

      display: flex;
    }

    .product-card__stock {
      grid-area: stock;

      @apply flex flex-row flex-wrap items-center gap-1.5 border-b border-neutral-200 pb-2.5;

      @container (min-width: 60rem) {
        @apply flex-col items-start gap-[0.3125rem] border-0 pb-0;
      }
    }

    :deep(.vc-product-image) {
      @container (width < 34rem) {
        @apply hidden;
      }
    }

    // The kit gives the price its own width in a row; here it keeps to its column, figure over the
    // struck list price, both on the right edge.
    :deep(.vc-product-price) {
      --vc-product-price-font-size: 1.25rem;

      @apply m-0 flex w-full min-w-0 flex-row flex-wrap items-baseline justify-start gap-x-1.5 whitespace-nowrap text-start;

      @container (min-width: 60rem) {
        @apply justify-end text-end;
      }
    }

    :deep(.vc-quantity-stepper),
    :deep(.vc-product-button) {
      @apply m-0 w-full min-w-[9.375rem] max-w-none;
    }

    // In a row the quick actions are ordinary controls beside the button, not an overlay on the photo,
    // so they are always there.
    :deep(.vc-product-actions) {
      grid-area: actions;

      @apply static flex-row bg-transparent p-0 opacity-100;
    }

    :deep(.vc-product-actions-button:not(.vc-product-actions-button--active)) {
      @apply text-neutral-400 hover:text-neutral-500;
    }
  }

  $list: "";

  &--list {
    $list: &;
  }

  &__variations-button {
    @apply hidden;

    #{$list} & {
      @container (min-width: theme("containers.3xl")) {
        @apply block;
      }
    }
  }

  &__variations-link-button {
    @apply block;

    #{$list} & {
      @container (min-width: theme("containers.3xl")) {
        @apply hidden;
      }
    }
  }

  &__variants-wrapper {
    @apply border-t border-neutral-200 p-6 pt-4 hidden;

    #{$list} & {
      @container (min-width: theme("containers.3xl")) {
        @apply block;
      }
    }
  }

  &__variants-loader {
    @apply flex justify-center py-8;
  }

  &__variants-title {
    @apply pb-3 leading-5;
  }
}
</style>
