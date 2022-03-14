<template>
  <VcPopup title="Reorder confirmation">
    <template #actions="{ close }">
      <div v-if="pages > 1 && !isMobile" class="lg:flex lg:flex-1">
        <VcPagination v-model:page="page" :pages="pages" @update:page="page = $event"></VcPagination>
      </div>
      <div class="flex flex-1 sm:flex-initial space-x-3">
        <VcButton
          is-outline
          kind="secondary"
          class="px-4 uppercase flex-grow lg:flex-grow-0 inline-flex"
          @click="close"
        >
          Cancel
        </VcButton>

        <VcButton
          class="uppercase flex-grow lg:flex-grow-0 inline-flex px-4"
          @click="
            close();
            addToCart();
          "
        >
          Confirm
        </VcButton>
      </div>
    </template>
    <template #default="{ close }">
      <div class="flex items-center p-5 space-x-4 shadow-lg">
        <span v-if="!isMobile" class="text-sm">Filter products:</span>
        <VcCheckbox
          v-model="reducedQuantityFilter"
          :class="!reducedQuantityFilter && 'text-gray-300'"
          @change="applyFilters"
          >Reduced quantity</VcCheckbox
        >
        <VcCheckbox
          v-model="cantBePurchasedFilter"
          :class="!cantBePurchasedFilter && 'text-gray-300'"
          @change="applyFilters"
          >Can’t be purchased</VcCheckbox
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
        @close-popup="close"
      ></ProductCardReorder>
      <div v-if="pages > 1 && isMobile" class="flex p-5">
        <VcPagination v-model:page="page" :pages="pages" class="lg:mb-0" @update:page="page = $event"></VcPagination>
      </div>
    </template>
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
import { useRouter } from "vue-router";

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

const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const reducedQuantityFilter = ref(false);
const cantBePurchasedFilter = ref(false);
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

  if (!withoutChangesFilter.value && !cantBePurchasedFilter.value && !reducedQuantityFilter.value) {
    filteredItems.value = extendedProducts.value;
    return;
  }

  if (reducedQuantityFilter.value) {
    let filteredProducts = applyReducedQuantityFilter();
    filteredItems.value = [...filteredItems.value, ...filteredProducts];
  }
  if (cantBePurchasedFilter.value) {
    let filteredProducts = applyCantBePurchasedFilter();
    filteredItems.value = [...filteredItems.value, ...filteredProducts];
  }
  if (withoutChangesFilter.value) {
    let filteredProducts = applyWithoutChangesFilter();
    filteredItems.value = [...filteredItems.value, ...filteredProducts];
  }
};

//TODO: change 'any' for a normal type
const setProductCardRef = (el: any) => {
  if (el) {
    productCardRefs.value.push(el);
  }
};

const addToCart = async () => {
  let modifiedCartLineItems: CartItemType[] = [];
  _.each(productCardRefs.value, (productCard) => modifiedCartLineItems.push(productCard.updateQuantity()));
  modifiedCartLineItems = _.uniq(modifiedCartLineItems);
  modifiedCartLineItems = _.filter(modifiedCartLineItems, (item) => item !== undefined && item.quantity !== 0);

  const originalCartLineItems = _.filter(
    extendedProducts.value,
    (product) => product.availabilityData?.isAvailable === true
  ).map((product) => {
    return { productId: product.id, quantity: product.quantity! };
  });

  _.each(modifiedCartLineItems, (reorderItem) => {
    const itemToReplace = _.find(originalCartLineItems, (lineItem) => lineItem.productId === reorderItem.productId);
    if (itemToReplace) {
      itemToReplace.quantity = reorderItem.quantity;
    }
  });

  await addMultipleItemsToCart(originalCartLineItems).then(() => {
    router.push({ name: "Checkout" });
  });
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

function applyReducedQuantityFilter() {
  return _.filter(extendedProducts.value, (item) => {
    const oldQuantity = _.find(props.orderItemsInfo, (orderItem) => orderItem.productId === item.id)?.quantity;
    if (item.availabilityData?.isInStock) {
      return oldQuantity! > item.availabilityData?.availableQuantity;
    } else return false;
  });
}

function applyCantBePurchasedFilter() {
  return _.filter(extendedProducts.value, (item) => {
    return !item.availabilityData?.isInStock || !item.availabilityData.isAvailable;
  });
}

function applyWithoutChangesFilter() {
  return _.filter(extendedProducts.value, (item) => {
    const oldQuantity = _.find(props.orderItemsInfo, (orderItem) => orderItem.productId === item.id)?.quantity;
    return oldQuantity! < item.availabilityData?.availableQuantity && item.availabilityData?.isAvailable === true;
  });
}
</script>
