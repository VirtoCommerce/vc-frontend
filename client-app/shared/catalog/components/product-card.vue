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

      <VcProductActions
        :direction="viewMode === 'grid' ? 'vertical' : 'horizontal'"
        :with-background="viewMode === 'grid'"
      >
        <AddToList :product="product" />

        <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="product" />
      </VcProductActions>
    </template>

    <VcProductTitle
      :title="product.name"
      :to="link"
      lines-number="2"
      fix-height
      @click="$emit('linkClick', product, $event)"
    />

    <VcProductVendor v-if="$cfg.vendor_enabled">
      {{ product.vendor?.name }}
    </VcProductVendor>

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
import { useBrowserTarget } from "@/core/composables";
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

const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product))
    .filter((property) => property.name !== PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME)
    // Two, as the design has it: a third row turns the card into a table of attributes, and the
    // grid is scanned for the product, not read for its specification.
    .slice(0, 2),
);

const badgeSize = computed(() => {
  return props.viewMode === "grid" ? "lg" : "md";
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
  // The design puts the specification in chips rather than a two-column table with dotted leaders:
  // on a card the pair is scanned, not read across, and the leader draws the eye along a line that
  // carries nothing.
  :deep(.vc-product-properties) {
    @apply flex flex-wrap items-center gap-1.5;
  }

  // The brand reads as an eyebrow over the title, not as a line under it: it is what the eye lands
  // on first when scanning a grid of products it does not yet know.
  :deep(.vc-product-vendor) {
    @apply mt-0 text-[0.6875rem] uppercase leading-[1.1rem] tracking-[0.06em] text-neutral-500;

    order: 0;
  }

  &__spec {
    @apply inline-flex max-w-full items-baseline gap-1 rounded-full px-2 py-1 text-xs leading-none;

    background: color-mix(in srgb, theme("colors.neutral.950") 5%, transparent);
  }

  &__spec-label {
    @apply shrink-0 font-bold text-neutral-600;
  }

  &__spec-value {
    @apply truncate font-normal text-neutral-950;
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
