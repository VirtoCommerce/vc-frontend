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
        <div v-else class="w-2/3 bg-neutral-200 text-3xl md:w-1/3">&nbsp;</div>

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

          <div v-else class="flex flex-col rounded border bg-additional-50 shadow-sm">
            <WishlistProductItemSkeleton v-for="i in actualPageRowsCount" :key="i" class="even:bg-neutral-50" />
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
                @link-click="selectItemEvent"
              />

              <p v-if="page >= PAGE_LIMIT" class="my-3 text-center">{{ $t("ui_kit.reach_limit.page_limit") }}</p>

              <VcPagination
                v-if="pagesCount > 1"
                v-model:page="page"
                :pages="Math.min(pagesCount, PAGE_LIMIT)"
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
          icon="outline-lists"
        >
          <template #button>
            <VcButton v-if="!!continue_shopping_link" :external-link="continue_shopping_link">
              {{ $t("shared.wishlists.list_details.empty_list_button") }}
            </VcButton>

            <VcButton v-else to="/">
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
import { cloneDeep, isEqual, keyBy, pick } from "lodash";
import { computed, ref, watchEffect, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import { useAnalytics, useHistoricalEvents, usePageHead } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { PAGE_LIMIT } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { prepareLineItem } from "@/core/utilities";
import { dataChangedEvent, useBroadcast } from "@/shared/broadcast";
import { useShortCart, getItemsForAddBulkItemsToCartResultsModal } from "@/shared/cart";
import { ProductSkeletonGrid } from "@/shared/catalog";
import { SaveChangesModal } from "@/shared/common";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import {
  useWishlists,
  AddOrUpdateWishlistModal,
  DeleteWishlistProductModal,
  WishlistLineItems,
  WishlistProductItemSkeleton,
} from "@/shared/wishlists";
import type {
  InputUpdateWishlistItemsType,
  InputUpdateWishlistLineItemType,
  LineItemType,
  Product,
} from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";
import type { RouteLocationNormalized } from "vue-router";
import AddBulkItemsToCartResultsModal from "@/shared/cart/components/add-bulk-items-to-cart-results-modal.vue";
interface IProps {
  listId: string;
}

const props = defineProps<IProps>();

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { t } = useI18n();
const { analytics } = useAnalytics();
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
const { trackAddItemToCart, trackAddItemsToCart } = useAnalyticsUtils();
const { pushHistoricalEvent } = useHistoricalEvents();

usePageHead({
  title: computed(() => t("pages.account.list_details.meta.title", [list.value?.name])),
});

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const itemsPerPage = ref(6);
const page = ref(1);
const wishlistItems = ref<LineItemType[]>([]);
const listElement = ref<HTMLElement | undefined>();
const pendingItems = ref<Record<string, boolean>>({});

const cartItemsBySkus = computed(() => keyBy(cart.value?.items, "sku"));
const preparedLineItems = computed<PreparedLineItemType[]>(() =>
  wishlistItems.value.map((item) => prepareLineItem(item, cartItemsBySkus.value[item.sku]?.quantity)),
);
const loading = computed<boolean>(() => listLoading.value || cartLoading.value || cartChanging.value);
const pagesCount = computed<number>(() => Math.ceil((wishlistItems.value.length ?? 0) / itemsPerPage.value));
const pagedListItems = computed<PreparedLineItemType[]>(() =>
  preparedLineItems.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
);
const actualPageRowsCount = computed<number>(() => pagedListItems.value.length || itemsPerPage.value);
const isDirty = computed<boolean>(() => {
  const originalItemsToCompare = (list.value?.items ?? []).map((item) => pick(item, ["productId", "quantity"]));
  const changedItemsToCompare = (wishlistItems.value ?? []).map((item) => pick(item, ["productId", "quantity"]));
  return !isEqual(originalItemsToCompare, changedItemsToCompare);
});
const wishlistListProperties = computed(() => ({
  item_list_id: "wishlist",
  item_list_name: `Wishlist "${list.value?.name}"`,
  related_id: list.value?.id,
  related_type: "wishlist",
}));

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

  const products = wishlistItems.value
    .map((item) => item.product)
    .filter((product): product is NonNullable<typeof product> => !!product);

  if (products.length) {
    trackAddItemsToCart(products);
    void pushHistoricalEvent({ eventType: "addToCart", productIds: products.map((product) => product.id) });
  }

  showResultModal(wishlistItems.value);
}
async function updateItems() {
  const payload: InputUpdateWishlistItemsType = {
    listId: list.value!.id,
    items: wishlistItems.value
      .filter((el) => !!el.product)
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
      component: SaveChangesModal,
      props: {
        title: t("pages.account.list_details.save_changes"),
        message: t("pages.account.list_details.save_changes_message"),
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

    trackAddItemToCart(lineItem.product, quantity);
    void pushHistoricalEvent({ eventType: "addToCart", productId: lineItem.product.id });
  }
  pendingItems.value[lineItem.id] = false;

  showResultModal([lineItem]);
}

function openDeleteProductModal(values: string[]): void {
  const item = list.value?.items?.find((i) => values.includes(i.id));

  if (item) {
    openModal({
      component: DeleteWishlistProductModal,
      props: {
        listId: list.value?.id,
        listItem: item,
        loading: loading.value,

        onResult() {
          const previousPagesCount = pagesCount.value;

          void broadcast.emit(dataChangedEvent);

          wishlistItems.value = wishlistItems.value?.filter((listItem) => listItem.id !== item.id);

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

async function canChangeRoute(to: RouteLocationNormalized): Promise<boolean> {
  return to.name === "NoAccess" || !list.value || !isDirty.value || (await openSaveChangesModal());
}

function selectItemEvent(item: Product | undefined): void {
  if (!item) {
    return;
  }

  analytics("selectItem", item, wishlistListProperties.value);
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
    analytics("viewItemList", items, wishlistListProperties.value);
  }
});
</script>
