<template>
  <template v-if="saveForLaterLoading">
    <div class="contents md:flex md:flex-wrap md:items-center md:justify-between md:gap-3">
      <VcTypography tag="h1">
        {{ $t("pages.cart.saved_for_later") }}
      </VcTypography>
    </div>

    <div class="mt-5 w-full">
      <WishlistProductsSkeleton :itemsCount="6" />
    </div>
  </template>

  <div v-else-if="savedForLaterListId && !savedForLaterListIsEmpty">
    <VcLoaderOverlay :visible="cartLoading" fixed-spinner />

    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <div class="flex flex-col">
      <!-- Title block -->
      <div class="contents md:flex md:flex-wrap md:items-center md:justify-between md:gap-3">
        <VcTypography tag="h1" truncate>
          {{ $t("pages.cart.saved_for_later") }}
        </VcTypography>

        <div class="order-last mt-8 flex flex-wrap gap-3 md:ms-0 md:mt-0 md:shrink-0 lg:my-0">
          <VcButton
            data-test-id="add-all-to-cart-button"
            :disabled="loading || !pagedListItems.length"
            size="sm"
            variant="outline"
            prepend-icon="cart"
            class="w-full md:order-last md:w-auto"
            @click="addAllListItemsToCart"
          >
            {{ $t("shared.wishlists.list_details.add_all_to_cart_button") }}
          </VcButton>

          <VcButton
            :disabled="loading || !pagedListItems.length"
            :loading="createCartFromWishlistLoading"
            size="sm"
            prepend-icon="cart-check"
            class="w-full md:order-last md:w-auto"
            @click="buyNow"
          >
            {{ $t("common.buttons.buy_now") }}
          </VcButton>

          <VcButton
            :disabled="loading || !isDirty || !savedForLaterList"
            size="sm"
            variant="outline"
            prepend-icon="save-v2"
            class="grow"
            @click="openSaveChangesModal"
          >
            {{ $t("common.buttons.save_changes") }}
          </VcButton>
        </div>
      </div>

      <div ref="listElement" class="mt-5 w-full">
        <VcWidget size="lg">
          <div class="flex flex-col gap-6">
            <WishlistLineItems
              :items="pagedListItems"
              :pending-items="pendingItems"
              @update:cart-item="addOrUpdateCartItem"
              @update:list-item="updateSavedForLaterItem"
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
      </div>
    </div>
  </div>

  <div v-else>
    <VcTypography tag="h1">
      {{ $t("pages.cart.saved_for_later") }}
    </VcTypography>

    <VcEmptyView :text="$t('pages.cart.saved_for_later_not_found')" icon="list-v2" />
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { cloneDeep, isEqual, keyBy, pick } from "lodash-es";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from "vue-router";
import { updateWishlistItems } from "@/core/api/graphql/account";
import { useAnalytics, useHistoricalEvents, usePageHead } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { PAGE_LIMIT } from "@/core/constants";
import { prepareLineItem, Logger } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { dataChangedEvent, useBroadcast } from "@/shared/broadcast";
import { useShortCart, getItemsForAddBulkItemsToCartResultsModal } from "@/shared/cart";
import { useSavedForLater } from "@/shared/cart/composables/useSaveForLater";
import { SaveChangesModal } from "@/shared/common";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import { DeleteWishlistProductModal, WishlistLineItems, WishlistProductsSkeleton } from "@/shared/wishlists";
import type { LineItemType, Product } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";
import type { RouteLocationNormalized } from "vue-router";
import AddBulkItemsToCartResultsModal from "@/shared/cart/components/add-bulk-items-to-cart-results-modal.vue";

const { t } = useI18n();
const { analytics } = useAnalytics();
const broadcast = useBroadcast();
const { openModal } = useModal();
const { savedForLaterList, loading: saveForLaterLoading, getSavedForLater, moveFromSavedForLater } = useSavedForLater();
const {
  loading: cartLoading,
  changing: cartChanging,
  cart,
  refetch: refetchCart,
  changeItemQuantity,
  createCartFromWishlist,
  createCartFromWishlistLoading,
} = useShortCart();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { trackAddItemToCart, trackAddItemsToCart } = useAnalyticsUtils();
const { pushHistoricalEvent } = useHistoricalEvents();

usePageHead({
  title: computed(() => t("pages.account.list_details.meta.title", [t("pages.cart.saved_for_later")])),
});

const router = useRouter();

const ITEMS_PER_PAGE = 6;

const page = ref(1);
const savedForLaterItems = ref<LineItemType[]>([]);
const listElement = ref<HTMLElement | undefined>();
const pendingItems = ref<Record<string, boolean>>({});

const savedForLaterListId = computed(() => savedForLaterList.value?.id);
const savedForLaterListIsEmpty = computed(() => !savedForLaterList.value?.items?.length);

const cartItemsBySkus = computed(() => keyBy(cart.value?.items, "sku"));
const preparedLineItems = computed<PreparedLineItemType[]>(() =>
  savedForLaterItems.value.map((item) => prepareLineItem(item, cartItemsBySkus.value[item.sku]?.quantity)),
);
const loading = computed<boolean>(() => cartLoading.value || cartChanging.value);
const pagesCount = computed<number>(() => Math.ceil(savedForLaterItems.value.length / ITEMS_PER_PAGE));
const pagedListItems = computed<PreparedLineItemType[]>(() =>
  preparedLineItems.value.slice((page.value - 1) * ITEMS_PER_PAGE, page.value * ITEMS_PER_PAGE),
);
const isDirty = computed<boolean>(() => {
  const originalItemsToCompare = (savedForLaterList.value?.items ?? []).map((item) =>
    pick(item, ["productId", "quantity"]),
  );
  const changedItemsToCompare = (savedForLaterItems.value ?? []).map((item) => pick(item, ["productId", "quantity"]));
  return !isEqual(originalItemsToCompare, changedItemsToCompare);
});
const savedForLaterListProperties = computed(() => ({
  item_list_id: "wishlist",
  item_list_name: `Wishlist "${savedForLaterList.value?.name}"`,
  related_id: savedForLaterList.value?.id,
  related_type: "wishlist",
}));

const isMobile = breakpoints.smaller("lg");

async function moveLineItemsToCart(lineItemIds: string[]): Promise<void> {
  if (!cart.value?.id) {
    await refetchCart();
  }

  if (!cart.value?.id) {
    Logger.error(`${moveLineItemsToCart.name}: cart is not available`);
    return;
  }

  await moveFromSavedForLater(cart.value.id, lineItemIds);
  await Promise.all([getSavedForLater(), refetchCart()]);
}

async function addAllListItemsToCart(): Promise<void> {
  if (!savedForLaterList.value || !savedForLaterItems.value.length) {
    return;
  }

  await moveLineItemsToCart(savedForLaterItems.value.map((item) => item.id));

  const products = savedForLaterItems.value
    .map((item) => item.product)
    .filter((product): product is NonNullable<typeof product> => !!product);

  if (products.length) {
    trackAddItemsToCart(products);
    void pushHistoricalEvent({ eventType: "addToCart", productIds: products.map((product) => product.id) });
  }

  showResultModal(savedForLaterItems.value);
}

async function updateItems() {
  if (!savedForLaterList.value) {
    return;
  }

  await updateWishlistItems({
    listId: savedForLaterList.value.id,
    items: savedForLaterItems.value
      .filter((el) => !!el.product)
      .map((item) => ({
        lineItemId: item.id,
        quantity: item.quantity,
      })),
  });

  savedForLaterList.value.items = cloneDeep(savedForLaterItems.value);
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
          savedForLaterItems.value = cloneDeep(savedForLaterList.value!.items) as LineItemType[];
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
      listName: t("pages.cart.saved_for_later"),
      items: getItemsForAddBulkItemsToCartResultsModal(items, cart.value!),
    },
  });
}

function updateSavedForLaterItem(item: PreparedLineItemType, quantity: number): void {
  const existItem = savedForLaterItems.value?.find((i) => i.id === item.id);
  if (existItem) {
    existItem.quantity = quantity;
  }
}

async function addOrUpdateCartItem(item: PreparedLineItemType, quantity: number): Promise<void> {
  const lineItem: LineItemType | undefined = savedForLaterItems.value.find(
    (listItem) => listItem.productId === item.productId,
  );

  if (!lineItem?.product || pendingItems.value[lineItem.id]) {
    return;
  }

  const itemInCart = cart.value?.items?.find((cartItem) => cartItem.productId === item.productId);

  pendingItems.value[lineItem.id] = true;
  try {
    if (itemInCart) {
      if (itemInCart.quantity !== quantity) {
        await changeItemQuantity(itemInCart.id, quantity);
      }
    } else {
      await moveLineItemsToCart([lineItem.id]);
      trackAddItemToCart(lineItem.product, quantity);
      void pushHistoricalEvent({ eventType: "addToCart", productId: lineItem.product.id });
    }
  } finally {
    pendingItems.value[lineItem.id] = false;
  }

  showResultModal([lineItem]);
}

function openDeleteProductModal(values: string[]): void {
  const item = savedForLaterList.value?.items?.find((i) => values.includes(i.id));

  if (item && savedForLaterList.value) {
    openModal({
      component: DeleteWishlistProductModal,
      props: {
        listId: savedForLaterList.value.id,
        listItem: item,
        loading: loading.value,

        onResult() {
          void broadcast.emit(dataChangedEvent);

          if (savedForLaterList.value) {
            savedForLaterList.value = {
              ...savedForLaterList.value,
              items: savedForLaterList.value.items?.filter((listItem) => listItem.id !== item.id),
            };
          }
        },
      },
    });
  }
}

async function canChangeRoute(to: RouteLocationNormalized): Promise<boolean> {
  return to.name === "NoAccess" || !savedForLaterList.value || !isDirty.value || (await openSaveChangesModal());
}

function selectItemEvent(item: Product | undefined): void {
  if (!item) {
    return;
  }

  analytics("selectItem", item, savedForLaterListProperties.value);
}

async function buyNow() {
  if (!savedForLaterList.value?.id) {
    return;
  }

  if (isDirty.value) {
    await openSaveChangesModal();
  }

  try {
    const result = await createCartFromWishlist(savedForLaterList.value.id);
    if (!result?.data?.createCartFromWishlist?.id) {
      Logger.error("Can't create cart from saved for later list", result);
      return;
    }

    void router.push({ name: ROUTES.CART_ID.NAME, params: { cartId: result.data.createCartFromWishlist.id } });
  } catch (error) {
    Logger.error("Can't create cart from saved for later list", error);
  }
}

onBeforeRouteLeave(canChangeRoute);
onBeforeRouteUpdate(canChangeRoute);

onMounted(() => {
  void getSavedForLater();
});

watchEffect(() => {
  page.value = 1;
  savedForLaterItems.value = (cloneDeep(savedForLaterList.value?.items) ?? []) as LineItemType[];
});

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  const items = savedForLaterList.value?.items
    ?.map((item) => item.product!)
    // filtering of deleted products
    .filter(Boolean);

  if (items?.length) {
    analytics("viewItemList", items, savedForLaterListProperties.value);
  }
});
</script>
