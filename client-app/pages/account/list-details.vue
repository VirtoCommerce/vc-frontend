<template>
  <div>
    <VcLoaderOverlay :visible="!listLoading && cartLoading" fixed-spinner />

    <BackButtonInHeader v-if="isMobile" @click="router.back()" />

    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between gap-x-3 md:mx-0">
      <h2 v-if="list?.name" class="truncate text-3xl font-bold uppercase text-gray-800">
        {{ list.name }}
      </h2>

      <!-- Title skeleton -->
      <div v-else class="w-2/3 bg-gray-200 text-3xl md:w-1/3">&nbsp;</div>

      <div class="hidden shrink-0 gap-x-3 lg:flex">
        <VcButton
          :is-disabled="loading || !canSaveChanges || !list"
          class="px-2.5 uppercase"
          size="sm"
          is-outline
          @click="saveChanges"
        >
          <VcIcon name="save-v2" size="sm" class="mr-2" />
          {{ $t("common.buttons.save_changes") }}
        </VcButton>

        <VcButton
          :is-disabled="loading || !list"
          class="px-2.5 uppercase"
          size="sm"
          is-outline
          @click="openListSettingsModal"
        >
          <VcIcon name="cog" size="sm" class="mr-2" />
          {{ $t("shared.wishlists.list_card.list_settings_button") }}
        </VcButton>

        <VcButton
          :is-disabled="loading || !pagedListItems.length"
          class="px-2.5 uppercase"
          size="sm"
          @click="addAllListItemsToCart"
        >
          <VcIcon name="cart" size="sm" class="mr-2" />
          {{ $t("shared.wishlists.list_details.add_all_to_cart_button") }}
        </VcButton>
      </div>
    </div>

    <!-- Skeletons -->
    <template v-if="listLoading">
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
          @update:cart-item="addOrUpdateCartItem"
          @update:list-item="updateWishListItem"
          @remove:list-item="openDeleteProductModal"
        />

        <VcPagination
          v-if="pagesCount > 1"
          v-model:page="page"
          :pages="pagesCount"
          class="self-start"
          @update:page="onUpdatePage()"
        />
      </div>
    </template>

    <!-- Empty list -->
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

    <div class="flex flex-wrap gap-5 py-7 lg:hidden lg:justify-end lg:p-0">
      <VcButton
        :is-disabled="loading || !pagedListItems.length"
        size="sm"
        class="w-full px-2.5 uppercase"
        @click="addAllListItemsToCart"
      >
        <VcIcon name="cart" size="sm" class="mr-2" />
        {{ $t("shared.wishlists.list_details.add_all_to_cart_button") }}
      </VcButton>

      <div class="flex w-full gap-x-5">
        <VcButton
          :is-disabled="loading || !list"
          class="w-1/2 px-2.5 uppercase"
          size="sm"
          is-outline
          @click="openListSettingsModal"
        >
          <VcIcon name="cog" size="sm" class="mr-2" />
          {{ $t("shared.wishlists.list_card.list_settings_button") }}
        </VcButton>

        <VcButton
          :is-disabled="loading || !canSaveChanges || !list"
          class="w-1/2 px-2.5 uppercase"
          size="sm"
          is-outline
          @click="saveChanges"
        >
          <VcIcon name="save-v2" size="sm" class="mr-2" />
          {{ $t("common.buttons.save_changes") }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { cloneDeep, isEqual, keyBy } from "lodash";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useGoogleAnalytics, usePageHead } from "@/core/composables";
import { prepareLineItem } from "@/core/utilities";
import { useCart, getItemsForAddBulkItemsToCartResultsPopup, AddBulkItemsToCartResultsModal } from "@/shared/cart";
import { ProductSkeletonGrid } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { usePopup } from "@/shared/popup";
import {
  useWishlists,
  AddOrUpdateWishlistModal,
  DeleteWishlistProductModal,
  WishlistLineItems,
  WishlistProductItemSkeleton,
} from "@/shared/wishlists";
import type { PreparedLineItemType } from "@/core/types";
import type {
  InputNewBulkItemType,
  InputUpdateWishlistItemsType,
  InputUpdateWishlistLineItemType,
  LineItemType,
  Product,
} from "@/xapi/types";

interface IProps {
  listId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const ga = useGoogleAnalytics();
const { openPopup } = usePopup();
const { loading: listLoading, list, fetchWishList, clearList, updateWishlistItemsQuantities } = useWishlists();
const { loading: cartLoading, cart, addBulkItemsToCart, addToCart, changeItemQuantity } = useCart();
const breakpoints = useBreakpoints(breakpointsTailwind);
const router = useRouter();

usePageHead({
  title: computed(() => t("pages.account.list_details.meta.title", [list.value?.name])),
});

const itemsPerPage = ref(6);
const page = ref(1);
const wishlistItems = ref<LineItemType[]>([]);

const cartItemsBySkus = computed(() => keyBy(cart.value.items, "sku"));
const preparedLineItems = computed<PreparedLineItemType[]>(() =>
  wishlistItems.value.map((item) => prepareLineItem(item, cartItemsBySkus.value[item.sku!]?.quantity))
);
const loading = computed<boolean>(() => listLoading.value || cartLoading.value);
const pagesCount = computed<number>(() => Math.ceil((wishlistItems.value.length ?? 0) / itemsPerPage.value));
const pagedListItems = computed<PreparedLineItemType[]>(() =>
  preparedLineItems.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);
const actualPageRowsCount = computed<number>(() => pagedListItems.value.length || itemsPerPage.value);
const canSaveChanges = computed<boolean>(() => !isEqual(list.value?.items, wishlistItems.value));

const isMobile = breakpoints.smaller("lg");

function openListSettingsModal(): void {
  openPopup({
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

  const payload = wishlistItems.value.map<InputNewBulkItemType>((item) => ({
    productSku: item.sku!,
    quantity: item.quantity,
  }));

  const resultItems = await addBulkItemsToCart(payload);

  ga.addItemsToCart(wishlistItems.value);

  openPopup({
    component: AddBulkItemsToCartResultsModal,
    props: {
      items: getItemsForAddBulkItemsToCartResultsPopup(wishlistItems.value, resultItems),
    },
  });
}

async function saveChanges(): Promise<void> {
  const payload: InputUpdateWishlistItemsType = {
    listId: list.value!.id!,
    items: wishlistItems.value!.map<InputUpdateWishlistLineItemType>((item) => ({
      lineItemId: item.id,
      quantity: item.quantity!,
    })),
  };

  const closeDialog = openPopup({
    component: "VcConfirmationDialog",
    props: {
      variant: "info",
      noIcon: true,
      title: t("common.labels.save_changes"),
      text: t("common.messages.save_new_product_quantity"),
      onConfirm: async () => {
        closeDialog();

        await updateWishlistItemsQuantities(payload);
      },
      onClose: () => {
        wishlistItems.value = cloneDeep(list.value!.items!);
      },
    },
  });
}

function updateWishListItem(item: InputNewBulkItemType): void {
  const existItem = wishlistItems.value?.find((i) => i.sku === item.productSku);
  if (existItem) {
    existItem.quantity = item.quantity;
  }
}

async function addOrUpdateCartItem(item: InputNewBulkItemType): Promise<void> {
  const product: Product | undefined = wishlistItems.value.find(
    (listItem) => listItem.sku === item.productSku
  )?.product;

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

function openDeleteProductModal(item: LineItemType): void {
  openPopup({
    component: DeleteWishlistProductModal,
    props: {
      listId: list.value?.id,
      listItem: item,

      async onResult(): Promise<void> {
        const previousPagesCount = pagesCount.value;

        await fetchWishList(props.listId);

        wishlistItems.value = cloneDeep(list.value?.items || []);

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

/**
 * Scroll after page change.
 */
function onUpdatePage(): void {
  window.scroll({ top: 0, behavior: "smooth" });
}

watchEffect(async () => {
  clearList();
  await fetchWishList(props.listId);

  wishlistItems.value = cloneDeep(list.value?.items) || [];
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
