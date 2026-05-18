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

  <ListDetails
    v-else-if="savedForLaterListId && !savedForLaterListIsEmpty"
    :list-id="savedForLaterListId"
    :list-name="$t('pages.cart.saved_for_later')"
    hide-settings
    :add-to-cart-handler="moveSingleItemToCart"
    :add-all-to-cart-handler="moveAllItemsToCart"
  />

  <div v-else>
    <VcTypography tag="h1">
      {{ $t("pages.cart.saved_for_later") }}
    </VcTypography>

    <VcEmptyView :text="$t('pages.cart.saved_for_later_not_found')" icon="list-v2" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart";
import { useSavedForLater } from "@/shared/cart/composables/useSaveForLater";
import { WishlistProductsSkeleton } from "@/shared/wishlists";
import ListDetails from "./list-details.vue";
import type { LineItemType } from "@/core/api/graphql/types";

const { savedForLaterList, loading: saveForLaterLoading, getSavedForLater, moveFromSavedForLater } = useSavedForLater();
const { cart, refetch: refetchCart } = useShortCart();

const savedForLaterListId = computed(() => savedForLaterList.value?.id);
const savedForLaterListIsEmpty = computed(() => !savedForLaterList.value?.items?.length);

async function moveSingleItemToCart(item: LineItemType): Promise<void> {
  await moveLineItemsToCart([item.id]);
}

async function moveAllItemsToCart(items: LineItemType[]): Promise<void> {
  await moveLineItemsToCart(items.map((item) => item.id));
}

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

onMounted(() => {
  void getSavedForLater();
});
</script>
