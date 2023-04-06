<template>
  <div>
    <VcLoaderOverlay :visible="loading" fixed-spinner />

    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between md:mx-0">
      <h2 class="truncate text-3xl font-bold uppercase text-gray-800">
        {{ list?.name }}
      </h2>

      <div v-if="!isMobile" class="flex gap-x-3">
        <VcButton class="w-36 px-3 uppercase" size="sm" is-outline @click="openListSettingsModal">
          <i class="fas fa-cog -ml-0.5 mr-2 text-inherit" />
          {{ $t("shared.wishlists.list_card.list_settings_button") }}
        </VcButton>

        <VcButton v-if="pagedListItems.length" class="w-56 px-3 uppercase" size="sm" @click="addAllListItemsToCart">
          <i class="fa fa-shopping-cart mr-2 text-xs text-inherit" />
          {{ $t("shared.wishlists.list_details.add_all_to_cart_button") }}
        </VcButton>
      </div>
    </div>

    <!-- Skeletons -->
    <template v-if="loading">
      <div v-if="isMobile" class="mx-5 grid grid-cols-2 gap-x-4 gap-y-6 md:mx-0">
        <ProductSkeletonGrid v-for="i in actualPageRowsCount" :key="i" />
      </div>

      <div v-else class="flex flex-col rounded border bg-white shadow-sm">
        <WishlistProductItemSkeleton v-for="i in actualPageRowsCount" :key="i" class="even:bg-gray-50" />
      </div>
    </template>

    <!-- List details -->
    <template v-else-if="pagedListItems.length">
      <div class="flex flex-col gap-6 bg-white p-5 md:rounded md:border md:shadow-t-3sm">
        <WishlistLineItems
          :items="pagedListItems"
          @update:cart-item="updateCartItem"
          @update:list-item="updateWishListItem"
          @remove:list-item="openDeleteProductModal"
        />

        <VcPagination
          v-if="pages > 1"
          v-model:page="page"
          :pages="pages"
          class="self-start"
          @update:page="onUpdatePage()"
        />
      </div>
    </template>

    <!-- Empty -->
    <VcEmptyView v-else :text="$t('shared.wishlists.list_details.empty_list')">
      <template #icon>
        <VcImage :alt="$t('shared.wishlists.list_details.list_icon')" src="/static/images/common/list.svg" />
      </template>

      <template #button>
        <VcButton :to="{ name: 'Catalog' }" size="lg" class="w-48 font-bold uppercase">
          {{ $t("shared.wishlists.list_details.empty_list_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { clone } from "lodash";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useGoogleAnalytics, usePageHead } from "@/core/composables";
import { AddBulkItemsToCartResultsModal, getItemsForAddBulkItemsToCartResultsPopup, useCart } from "@/shared/cart";
import { ProductSkeletonGrid } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { usePopup } from "@/shared/popup";
import {
  WishlistProductItemSkeleton,
  WishlistLineItems,
  useWishlists,
  AddOrUpdateWishlistModal,
  DeleteWishlistProductModal,
  extendWishListItem,
} from "@/shared/wishlists";
import type { ExtendedLineItemType } from "@/core/types";
import type { InputNewBulkItemType, LineItemType, Product } from "@/xapi/types";

interface IProps {
  listId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { openPopup } = usePopup();
const { loading: listLoading, list, fetchWishList, clearList } = useWishlists();
const { cart, loading: cartLoading, addToCart, changeItemQuantity, addBulkItemsToCart } = useCart();
const ga = useGoogleAnalytics();

usePageHead({
  title: computed(() => t("pages.account.list_details.meta.title", [list.value?.name])),
});

const itemsPerPage = ref(6);
const page = ref(1);

const loading = computed<boolean>(() => listLoading.value || cartLoading.value);
const extendedItems = computed<ExtendedLineItemType<LineItemType>[]>(() =>
  (list.value?.items || []).map((listItem) => {
    const countInCart = cart.value.items?.find((cartItem) => cartItem.sku === listItem.sku)?.quantity;

    listItem.quantity =
      countInCart ||
      (listItem.product && listItem.product.minQuantity && (listItem.quantity || 0) < listItem.product.minQuantity
        ? listItem.product.minQuantity
        : listItem.quantity);
    return extendWishListItem(listItem, countInCart);
  })
);
const inputBulkItems = computed<InputNewBulkItemType[] | undefined>(() =>
  list.value?.items?.map<InputNewBulkItemType>((item) => ({
    productSku: item.sku!,
    quantity: item.quantity,
  }))
);
const pages = computed<number>(() => Math.ceil((list.value?.items?.length ?? 0) / itemsPerPage.value));
const pagedListItems = computed<ExtendedLineItemType<LineItemType>[]>(() =>
  extendedItems.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);
const actualPageRowsCount = computed<number>(() => pagedListItems.value.length || itemsPerPage.value);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

function updateWishListItem(item: InputNewBulkItemType): void {
  const inputBulkItem = inputBulkItems.value?.find((bulkItem) => bulkItem.productSku === item.productSku);
  if (inputBulkItem) {
    inputBulkItem.quantity = item.quantity;
  }
}

async function updateCartItem(item: InputNewBulkItemType): Promise<void> {
  const product: Product | undefined = list.value?.items?.find((listItem) => listItem.sku === item.productSku)?.product;

  if (!product) {
    return;
  }

  const itemInCart: LineItemType | undefined = cart.value.items?.find((cartItem) => cartItem.sku === item.productSku);

  if (itemInCart) {
    await changeItemQuantity(itemInCart.id, item.quantity!);
  } else {
    await addToCart(product.id, item.quantity!);

    ga.addItemToCart(product, item.quantity);
  }
}

async function addAllListItemsToCart() {
  if (!list.value || !inputBulkItems.value) {
    return;
  }

  const inputItems = clone(list.value.items!);
  const resultItems = await addBulkItemsToCart(inputBulkItems.value);

  ga.addItemsToCart(inputItems);

  inputItems.forEach((inputItem) => {
    const inputBulkItem = inputBulkItems.value?.find((item) => item.productSku === inputItem.sku);
    if (inputBulkItem) {
      inputItem.quantity = inputBulkItem.quantity;
    }
  });

  openPopup({
    component: AddBulkItemsToCartResultsModal,

    props: {
      items: getItemsForAddBulkItemsToCartResultsPopup(inputItems, resultItems),
    },
  });
}

function openDeleteProductModal(item: LineItemType) {
  openPopup({
    component: DeleteWishlistProductModal,
    props: {
      listItem: item,
      listId: list.value?.id,
      async onResult() {
        const previousPagesCount = pages.value;

        await fetchWishList(props.listId);

        /**
         * If you were on the last page, and after deleting the product
         * the number of pages has decreased, go to the previous page
         */
        if (previousPagesCount > 1 && previousPagesCount === page.value && previousPagesCount > pages.value) {
          page.value -= 1;
        }
      },
    },
  });
}

function openListSettingsModal() {
  openPopup({
    component: AddOrUpdateWishlistModal,
    props: {
      list: list.value,
    },
  });
}

/**
 * Scroll after page change.
 */
function onUpdatePage() {
  window.scroll({ top: 0, behavior: "smooth" });
}

watchEffect(() => {
  clearList();
  fetchWishList(props.listId);
});

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  const items = list.value?.items
    ?.map((item) => item.product!)
    // filtering of deleted products
    .filter(Boolean);

  if (items?.length) {
    ga.viewItemList(items, {
      item_list_name: `Wishlist "${list.value?.name}"`,
    });
  }
});
</script>
