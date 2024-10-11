<template>
  <div
    :class="viewMode === 'list' ? '-mx-5 divide-y lg:divide-y-0 lg:mx-0 lg:space-y-3.5' : 'grid gap-5 ' + cssColumns"
  >
    <template v-if="loading">
      <component :is="skeletonComponent" v-for="i in itemsPerPage" :key="i" />
    </template>

    <template v-else>
      <component
        :is="cardComponent"
        v-for="(item, index) in products"
        :key="item.id + index"
        :product="item"
        :lazy="index >= lazyCardsCount"
        :open-in-new-tab="openProductInNewTab"
        :hide-properties="cardType === 'short'"
        :product-reviews-enabled="productReviewsEnabled"
        :back-in-stock-enabled="$cfg.back_in_stock_enabled"
        @link-click="$emit('itemLinkClick', item, $event)"
      >
        <template #add-to-list-handler>
          <slot name="add-to-list-handler" v-bind="{ item }" />
        </template>
        <template #cart-handler>
          <slot name="cart-handler" v-bind="{ item }" />
        </template>
      </component>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed, toRef, watch } from "vue";
import { BREAKPOINTS, DEFAULT_PAGE_SIZE } from "@/core/constants";
import { useCustomerReviews } from "@/modules/customer-reviews/useCustomerReviews";
import { useBackInStockSubscriptions } from "@/shared/back-in-stock";
import ProductCardGrid from "./product-card-grid.vue";
import ProductCardList from "./product-card-list.vue";
import ProductSkeletonGrid from "./product-skeleton-grid.vue";
import ProductSkeletonList from "./product-skeleton-list.vue";
import type { Product } from "@/core/api/graphql/types";

interface IEmits {
  (eventName: "itemLinkClick", product: Product, globalEvent: MouseEvent): void;
}

interface IProps {
  loading: boolean;
  products?: Product[];
  itemsPerPage?: number;
  viewMode?: string;
  openProductInNewTab?: boolean;
  cardType?: "full" | "short";
  columnsAmountTablet?: string;
  columnsAmountDesktop?: string;
  backInStockEnabled?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  itemsPerPage: DEFAULT_PAGE_SIZE,
  products: () => [],
  viewMode: "grid",
  columnsAmountTablet: "3",
  columnsAmountDesktop: "4",
});

const breakpoints = useBreakpoints(BREAKPOINTS);
const { enabled: productReviewsEnabled } = useCustomerReviews();
const { fetchSubscriptions } = useBackInStockSubscriptions();

const skeletonComponent = computed(() => (props.viewMode === "list" ? ProductSkeletonList : ProductSkeletonGrid));
const cardComponent = computed(() => (props.viewMode === "list" ? ProductCardList : ProductCardGrid));

const columns = computed(() => ({
  null: 1,
  xs: 2,
  md: Number(props.columnsAmountTablet),
  xl: Number(props.columnsAmountDesktop),
}));

const cssColumns = computed(() =>
  Object.entries(columns.value)
    .map(([key, value]) => {
      const delimiter = key ? ":" : "";
      return `${key}${delimiter}grid-cols-${value}`;
    })
    .join(" "),
);

const lazyCardsCount = computed(() => {
  if (props.viewMode === "grid") {
    return getGridLazyCardsCount();
  }
  if (props.viewMode == "list") {
    return getListLazyCardsCount();
  }
  return 0;
});

function getGridLazyCardsCount() {
  const rowCount = 2;
  if (breakpoints.isSmaller("xs")) {
    return columns.value.null;
  }
  if (breakpoints.isInBetween("xs", "md")) {
    return columns.value.xs * rowCount;
  }
  if (breakpoints.isInBetween("md", "xl")) {
    return columns.value.md * rowCount;
  }
  if (breakpoints.isGreaterOrEqual("xl")) {
    return columns.value.xl * rowCount;
  }
  return 0;
}

function getListLazyCardsCount() {
  if (breakpoints.isSmaller("xs")) {
    return 2;
  }
  if (breakpoints.isInBetween("xs", "sm")) {
    return 4;
  }
  if (breakpoints.isInBetween("sm", "lg")) {
    return 6;
  }
  if (breakpoints.isInBetween("lg", "2xl")) {
    return 4;
  }
  if (breakpoints.isGreaterOrEqual("2xl")) {
    return 5;
  }
  return 0;
}

watch(toRef(props, "products"), async (products) => {
  if (props.backInStockEnabled) {
    await fetchSubscriptions({ productIds: products.map((item) => item.id), isActive: true });
  }
});
</script>
