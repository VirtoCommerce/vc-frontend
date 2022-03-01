<template>
  <VcPopup title="Reorder confirmation">
    <template #actions="{ close }">
      <div v-if="pages > 1 && !isMobile">
        <VcPagination v-model:page="page" :pages="pages" @update:page="page = $event"></VcPagination>
      </div>
      <VcButton
        is-outline
        kind="secondary"
        class="lg:px-4 uppercase flex-grow lg:flex-grow-0 inline-flex"
        @click="close"
      >
        Cancel
      </VcButton>
      <VcButton
        to="/checkout"
        class="uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-4"
        @click="
          close();
          addToCart();
        "
      >
        Confirm
      </VcButton>
    </template>
    <div class="flex items-center p-5 space-x-4 shadow-lg">
      <span v-if="!isMobile" class="text-sm">Filter products:</span>
      <VcCheckbox
        v-model="reducedQuantityFilter"
        :class="!reducedQuantityFilter && 'text-gray-300'"
        @change="applyFilters"
        >Reduced quantity</VcCheckbox
      >
      <VcCheckbox v-model="outOfStockFilter" :class="!outOfStockFilter && 'text-gray-300'" @change="applyFilters"
        >Out of stock</VcCheckbox
      >
      <VcCheckbox
        v-model="withoutChangesFilter"
        :class="!withoutChangesFilter && 'text-gray-300'"
        @change="applyFilters"
        >Items without changes</VcCheckbox
      >
    </div>
    <ProductCardReorder
      v-for="item in paginatedItems"
      :ref="setProductCardRef"
      :key="item?.id"
      :product-item="item"
    ></ProductCardReorder>
    <div v-if="pages > 1 && isMobile" class="flex p-5">
      <VcPagination v-model:page="page" :pages="pages" class="lg:mb-0" @update:page="page = $event"></VcPagination>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, onBeforeUpdate, onMounted, PropType, ref } from "vue";
import { OrderLineItemType, Product } from "@/core/api/graphql/types";
import { VcPopup, VcButton, VcPagination, VcCheckbox } from "@/components";
import { ProductCardReorder } from "@/shared/account";
import _ from "lodash";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { CartItemType, useCart } from "@/shared/cart";

const itemsPerPage = 4;

//TODO: change 'any' for a normal type
const productCardRefs = ref<any[]>([]);

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },

  productItems: {
    type: Array as PropType<Product[]>,
    required: true,
  },

  orderItemsInfo: {
    type: Array as PropType<Pick<OrderLineItemType, "productId" | "quantity" | "id">[]>,
    required: true,
  },
});

const { addMultipleItemsToCart } = useCart();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const reducedQuantityFilter = ref(false);
const outOfStockFilter = ref(false);
const withoutChangesFilter = ref(false);

const extendedProducts = ref<
  (Product & {
    quantity: number | undefined;
    lineItemId: string | undefined;
  })[]
>([]);

const filteredItems = ref<
  (Product & {
    quantity: number | undefined;
    lineItemId: string | undefined;
  })[]
>([]);

const page = ref(1);
const paginatedItems = computed(() =>
  filteredItems.value.slice((page.value - 1) * itemsPerPage, page.value * itemsPerPage)
);
const pages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage));

const applyFilters = () => {
  //Clear filter
  filteredItems.value = [];
  page.value = 1;

  if (!withoutChangesFilter.value && !outOfStockFilter.value && !reducedQuantityFilter.value) {
    filteredItems.value = extendedProducts.value;
    return;
  }

  if (reducedQuantityFilter.value) {
    let filteredProducts = _.filter(extendedProducts.value, (item) => {
      const oldQuantity = _.find(props.orderItemsInfo, (orderItem) => orderItem.productId === item.id)?.quantity;
      return oldQuantity! > item.availabilityData?.availableQuantity;
    });
    filteredItems.value = [...filteredItems.value, ...filteredProducts];
  }
  if (outOfStockFilter.value) {
    let filteredProducts = _.filter(extendedProducts.value, (item) => {
      return !item.availabilityData?.isInStock;
    });
    filteredItems.value = [...filteredItems.value, ...filteredProducts];
  }
  if (withoutChangesFilter.value) {
    let filteredProducts = _.filter(extendedProducts.value, (item) => {
      const oldQuantity = _.find(props.orderItemsInfo, (orderItem) => orderItem.productId === item.id)?.quantity;
      return oldQuantity! < item.availabilityData?.availableQuantity;
    });
    filteredItems.value = [...filteredItems.value, ...filteredProducts];
  }
};

//TODO: change 'any' for a normal type
const setProductCardRef = (el: any) => {
  if (el) {
    productCardRefs.value.push(el);
  }
};

const addToCart = () => {
  let cart: CartItemType[] = [];
  _.each(productCardRefs.value, (productCard) => cart.push(productCard.updateQuantity()));
  cart = _.uniq(cart);
  cart = _.filter(cart, (item) => item !== undefined && item.quantity !== 0);

  const originalCartLineItems = _.filter(props.orderItemsInfo, (itemInfo) => itemInfo.quantity !== 0).map(
    (itemInfo) => {
      return { productId: itemInfo.productId, quantity: itemInfo.quantity };
    }
  );

  _.each(cart, (reorderItem) => {
    const itemToReplace = _.find(originalCartLineItems, (lineItem) => lineItem.productId === reorderItem.productId);
    if (itemToReplace) {
      itemToReplace.quantity = reorderItem.quantity;
    }
  });

  addMultipleItemsToCart(originalCartLineItems);
};

onMounted(() => {
  extendedProducts.value = _.map(props.productItems, (product) => {
    const orderItem = _.find(props.orderItemsInfo, (orderItem) => orderItem.productId === product.id);
    return _.extend(product, { quantity: orderItem?.quantity, lineItemId: orderItem?.id });
  });
  filteredItems.value = extendedProducts.value;
});

onBeforeUpdate(() => {
  productCardRefs.value = [];
});
</script>
