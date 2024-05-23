<template>
  <div>
    <VcLoaderOverlay :visible="!listLoading && cartLoading" fixed-spinner />

    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <div class="flex flex-col">
      <!-- Title block -->
      <div class="contents md:flex md:flex-wrap md:items-center md:justify-between md:gap-3">
        <VcTypography v-if="list?.name" tag="h1" truncate>
          {{ list.name }}
        </VcTypography>

        <!-- Title skeleton -->
        <div v-else class="w-2/3 bg-gray-200 text-3xl md:w-1/3">&nbsp;</div>

        <div class="order-last mt-8 flex flex-wrap gap-3 md:ms-0 md:mt-0 md:shrink-0 lg:my-0">
          <VcButton
            :disabled="loading || !pagedListItems.length"
            size="sm"
            prepend-icon="cart"
            class="w-full md:order-last md:w-auto"
            @click="addAllListItemsToCart"
          >
            {{ $t("shared.wishlists.list_details.add_all_to_cart_button") }}
          </VcButton>

          <VcButton
            :disabled="loading || !isDirty || !list"
            size="sm"
            variant="outline"
            prepend-icon="save-v2"
            class="grow"
            @click="openSaveChangesModal"
          >
            {{ $t("common.buttons.save_changes") }}
          </VcButton>

          <VcButton
            :disabled="loading || !list"
            size="sm"
            variant="outline"
            prepend-icon="cog"
            class="grow"
            @click="openListSettingsModal"
          >
            {{ $t("shared.wishlists.list_details.list_settings_button") }}
          </VcButton>
        </div>
      </div>

      <div ref="listElement" class="mt-5 w-full">
        <!-- Skeletons -->
        <template v-if="listLoading">
          <div v-if="isMobile" class="grid grid-cols-2 gap-x-4 gap-y-6">
            <ProductSkeletonGrid v-for="i in actualPageRowsCount" :key="i" />
          </div>

          <div v-else class="flex flex-col rounded border bg-white shadow-sm">
            <WishlistProductItemSkeleton v-for="i in actualPageRowsCount" :key="i" class="even:bg-gray-50" />
          </div>
        </template>

        <!-- List details -->
        <template v-else-if="!listLoading && !!list?.items?.length">
          <VcWidget size="lg">
            <div class="flex flex-col gap-6">
              <WishlistLineItems
                :items="pagedListItems"
                :pending-items="pendingItems"
                @update:cart-item="addOrUpdateCartItem"
                @update:list-item="updateWishListItem"
                @remove:items="openDeleteProductModal"
              />

              <VcPagination
                v-if="pagesCount > 1"
                v-model:page="page"
                :pages="pagesCount"
                :scroll-target="listElement"
                :scroll-offset="60"
              />
            </div>
          </VcWidget>
        </template>

        <!-- Empty list -->
        <VcEmptyView
          v-else-if="!listLoading && list?.items?.length === 0"
          :text="$t('shared.wishlists.list_details.empty_list')"
          class="lg:mt-32"
        >
          <template #icon>
            <VcImage :alt="$t('shared.wishlists.list_details.list_icon')" src="/static/images/common/list.svg" />
          </template>

          <template #button>
            <VcButton :to="{ name: 'Catalog' }">
              {{ $t("shared.wishlists.list_details.empty_list_button") }}
            </VcButton>
          </template>
        </VcEmptyView>
        <Error404 v-else-if="!listLoading && !list" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { cloneDeep, isEqual, keyBy } from "lodash";
import { computed, ref, watchEffect, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { useGoogleAnalytics, usePageHead } from "@/core/composables";
import { prepareLineItem } from "@/core/utilities";
import { productsInWishlistEvent, useBroadcast } from "@/shared/broadcast";
import { useShortCart, getItemsForAddBulkItemsToCartResultsModal, AddBulkItemsToCartResultsModal } from "@/shared/cart";
import { ProductSkeletonGrid } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import {
  useWishlists,
  AddOrUpdateWishlistModal,
  DeleteWishlistProductModal,
  WishlistLineItems,
  WishlistProductItemSkeleton,
  SaveWishlistChangesModal,
} from "@/shared/wishlists";
import type {
  InputUpdateWishlistItemsType,
  InputUpdateWishlistLineItemType,
  LineItemType,
} from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";

interface IProps {
  listId: string;
}

const props = defineProps<IProps>();

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const { t } = useI18n();
const ga = useGoogleAnalytics();
const broadcast = useBroadcast();
const { openModal } = useModal();
const { listLoading, list, fetchWishList, updateItemsInWishlist } = useWishlists();
const {
  loading: cartLoading,
  changing: cartChanging,
  cart,
  addItemsToCart,
  addToCart,
  changeItemQuantity,
} = useShortCart();
const breakpoints = useBreakpoints(breakpointsTailwind);

usePageHead({
  title: computed(() => t("pages.account.list_details.meta.title", [list.value?.name])),
});

const itemsPerPage = ref(6);
const page = ref(1);
const wishlistItems = ref<LineItemType[]>([]);
const listElement = ref<HTMLElement | undefined>();
const pendingItems = ref<Record<string, boolean>>({});

const cartItemsBySkus = computed(() => keyBy(cart.value?.items, "sku"));
const preparedLineItems = computed<PreparedLineItemType[]>(() =>
  wishlistItems.value.map((item) => prepareLineItem(item, cartItemsBySkus.value[item.sku!]?.quantity)),
);
const loading = computed<boolean>(() => listLoading.value || cartLoading.value || cartChanging.value);
const pagesCount = computed<number>(() => Math.ceil((wishlistItems.value.length ?? 0) / itemsPerPage.value));
const pagedListItems = computed<PreparedLineItemType[]>(() =>
  preparedLineItems.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
);
const actualPageRowsCount = computed<number>(() => pagedListItems.value.length || itemsPerPage.value);
const isDirty = computed<boolean>(() => !isEqual(list.value?.items, wishlistItems.value));

const isMobile = breakpoints.smaller("lg");

function openListSettingsModal(): void {
  openModal({
    component: AddOrUpdateWishlistModal,
    props: {
      list: list.value,
    },
  });
}

async function addAllListItemsToCart(): Promise<void> {
  if (!list.value || !wishlistItems.value.length) {
    return;
  }

  const items = wishlistItems.value.map(({ productId, quantity }) => ({ productId, quantity }));
  await addItemsToCart(items);

  ga.addItemsToCart(wishlistItems.value);

  showResultModal(wishlistItems.value);
}
async function updateItems() {
  const payload: InputUpdateWishlistItemsType = {
    listId: list.value!.id!,
    items: wishlistItems
      .value!.filter((el) => !!el.product)
      .map<InputUpdateWishlistLineItemType>((item) => ({
        lineItemId: item.id,
        quantity: item.quantity,
      })),
  };
  await updateItemsInWishlist(payload);
}

async function openSaveChangesModal(): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const closeModal = openModal({
      component: SaveWishlistChangesModal,
      props: {
        onConfirm: async () => {
          closeModal();
          await updateItems();
          resolve(true);
        },
        onClose: () => {
          wishlistItems.value = cloneDeep(list.value!.items!);
          resolve(true);
        },
      },
    });
  });
}

function showResultModal(items: LineItemType[]) {
  openModal({
    component: AddBulkItemsToCartResultsModal,
    props: {
      listName: list.value?.name,
      items: getItemsForAddBulkItemsToCartResultsModal(items, cart.value!),
    },
  });
}

function updateWishListItem(item: PreparedLineItemType, quantity: number): void {
  const existItem = wishlistItems.value?.find((i) => i.id === item.id);
  if (existItem) {
    existItem.quantity = quantity;
  }
}

async function addOrUpdateCartItem(item: PreparedLineItemType, quantity: number): Promise<void> {
  const lineItem: LineItemType | undefined = wishlistItems.value.find(
    (listItem) => listItem.productId === item.productId,
  );

  if (!lineItem?.product) {
    return;
  }

  const itemInCart = cart.value?.items?.find((cartItem) => cartItem.productId === item.productId);
  if (pendingItems.value[lineItem.id]) {
    return;
  }
  pendingItems.value[lineItem.id] = true;
  if (itemInCart) {
    if (itemInCart.quantity !== quantity) {
      await changeItemQuantity(itemInCart.id, quantity);
    }
  } else {
    await addToCart(lineItem.product.id, quantity);

    ga.addItemToCart(lineItem.product, quantity);
  }
  pendingItems.value[lineItem.id] = false;

  showResultModal([lineItem]);
}

function openDeleteProductModal(values: string[]): void {
  // FIXME: Make wishlist items selectable and support multiple removal
  const item = list.value?.items?.find((i) => values.includes(i.id));

  if (item) {
    openModal({
      component: DeleteWishlistProductModal,
      props: {
        listId: list.value?.id,
        listItem: item,

        async onResult(): Promise<void> {
          const previousPagesCount = pagesCount.value;

          broadcast.emit(productsInWishlistEvent, [{ productId: item.productId, inWishlist: false }]);

          wishlistItems.value = wishlistItems.value?.filter((listItem) => listItem.id !== item.id);

          await fetchWishList(props.listId);

          /**
           * If you were on the last page, and after deleting the product
           * the number of pages has decreased, go to the previous page
           */
          if (previousPagesCount > 1 && previousPagesCount === page.value && previousPagesCount > pagesCount.value) {
            page.value -= 1;
          }
        },
      },
    });
  }
}

async function canChangeRoute() {
  return !list.value || !isDirty.value || (await openSaveChangesModal());
}

onBeforeRouteLeave(canChangeRoute);
onBeforeRouteUpdate(canChangeRoute);

watchEffect(async () => {
  await fetchWishList(props.listId);
  page.value = 1;
  wishlistItems.value = cloneDeep(list.value?.items) ?? [];
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
