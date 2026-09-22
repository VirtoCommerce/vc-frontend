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

    <VcProductVendor v-if="maker || product.hasVariations">
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
    </VcProductVendor>

    <VcProductTitle
      :title="product.name"
      :to="link"
      lines-number="2"
      fix-height
      @click="$emit('linkClick', product, $event)"
    />

    <VcProductProperties v-if="cardType !== 'short' && properties.length">
      <span v-for="(property, i) in properties" :key="i" class="product-card__spec">
        <b class="product-card__spec-label">{{ property.label }}</b>

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

    <AddToCartSimple v-else :product="product" :reserved-space="viewMode === 'grid'">
      <InStock
        labeled
        :is-in-stock="product.availabilityData?.isInStock"
        :is-digital="product.productType === ProductType.Digital"
        :quantity="product.availabilityData?.availableQuantity"
      />

      <CountInCart :product-id="product.id" :currency="product.price.currency" />
    </AddToCartSimple>

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
  // The lift on hover eases rather than snaps.
  @apply transition-shadow duration-200 ease-out;

  // The title is the product's name here, not a link away from the page: the grid is scanned for
  // what a thing is, and a column of blue underlines reads as navigation rather than as goods.
  --vc-product-title-link-color: theme("colors.neutral.950");
  --vc-product-title-link-hover-color: theme("colors.neutral.950");

  // The brand reads as an eyebrow over the title: it is what the eye lands on first when scanning a
  // grid of products it does not yet know.
  :deep(.vc-product-vendor) {
    @apply mt-0 text-xs uppercase leading-4 tracking-[0.12em] text-neutral-500;

    // The kit orders everything in the card through one sequence, media included — the photo, then
    // the title at 2. The brand shares the title's step and comes first in the markup, so it sits
    // between the two instead of above the photo.
    order: 2;
  }

  :deep(.vc-product-vendor) {
    @apply flex items-center gap-2;
  }

  &__maker {
    @apply truncate;
  }

  &__variants {
    @apply shrink-0 text-[0.6875rem] font-bold uppercase tracking-[0.08em];
  }

  :deep(.vc-product-title) {
    @apply mt-2.5;
  }

  // The specification as chips rather than a two-column table with dotted leaders: on a card the
  // pair is scanned, not read across. One chip per line, a rounded rectangle on the warm grey, 23px
  // at 13px — a pill read as a button, and two side by side ran into each other.
  :deep(.vc-product-properties) {
    @apply mt-2.5 flex flex-col items-start gap-[0.3125rem];
  }

  &__spec {
    @apply inline-flex max-w-full items-baseline gap-1 rounded-lg bg-neutral-100 px-2 py-[0.3125rem] text-[0.8125rem] leading-[0.8125rem];
  }

  &__spec-label {
    @apply shrink-0 font-bold text-neutral-950;
  }

  &__spec-value {
    @apply truncate font-normal text-neutral-600;
  }

  :deep(.vc-product-price__actual) {
    @apply font-extrabold;
  }

  // The stock chip at the design's measure: a 14px glyph beside 13px of text. The kit's small chip
  // draws a 10px glyph, which beside a sentence rather than a bare number read as a speck.
  // The chip rebuilds its glyph size from its own `--icon-size` on the content, so that is the knob.
  :deep(.vc-quantity-stepper__badges .vc-chip),
  :deep(.product-card__stock .vc-chip) {
    --icon-size: 0.875rem;

    .vc-chip__content {
      @apply text-[0.8125rem];
    }
  }

  // The quick actions come out on hover and on keyboard focus, and stay out where there is no hover
  // to reveal them — on a touch screen a hidden control is a missing one.
  :deep(.vc-product-actions) {
    @apply gap-1.5 transition-opacity duration-150;

    @media (hover: hover) {
      @apply opacity-0;
    }
  }

  // Each action is a 32px disc on the warm grey with a dark outline glyph, as the design draws them;
  // the kit's bare 24px glyph read as decoration on the photo rather than as a control. A picked
  // action keeps the kit's own colour so a saved or compared product still says so.
  :deep(.vc-product-actions-button) {
    --vc-icon-size: 1rem;

    @apply size-8 rounded-full bg-neutral-100 p-0 transition-colors duration-150 hover:bg-neutral-200;
  }

  :deep(.vc-product-actions-button:not(.vc-product-actions-button--active)) {
    @apply text-neutral-700 hover:text-neutral-950;
  }

  &:hover,
  &:focus-within {
    :deep(.vc-product-actions) {
      @apply opacity-100;
    }
  }

  // Grid: 18px of inside for the text, and the photo let out to 9px of it on a light grey plate with
  // no rule round it — the design's photo is wider than the column of type below it, and square.
  // Written two classes deep: the kit sizes the title and price through `.vc-product-card > wrapper`
  // selectors of the same weight as a one-class rule here, and it loads later.
  &.product-card--grid {
    // The design's type on the card: a 16px title and a 24px price.
    :deep(.vc-product-title) {
      --vc-product-title-font-size: 1rem;

      @apply text-base;
    }

    :deep(.vc-product-price) {
      --vc-product-price-font-size: 1.5rem;
    }

    :deep(.vc-product-card__wrapper) {
      @apply p-[1.125rem];
    }

    :deep(.vc-product-card__media) {
      @apply -mx-[0.5625rem] -mt-[0.5625rem];
    }

    // The badges lie on the photo, 8px in from its corner. The kit cuts them a notch out of the
    // photo instead — a white corner with rounded ears — which on the grey plate read as a patch.
    :deep(.badges-wrapper) {
      @apply start-2 top-2 bg-transparent p-0;

      &::before,
      &::after {
        @apply hidden;
      }
    }

    // The photo moved out by 9px, so the actions that hang in its corner move back in with it.
    :deep(.vc-product-actions) {
      @apply end-2 top-2;
    }

    :deep(.vc-product-image) {
      @apply aspect-square h-auto border-0;

      background: color-mix(in srgb, theme("colors.neutral.950") 3%, theme("colors.additional.50"));
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
