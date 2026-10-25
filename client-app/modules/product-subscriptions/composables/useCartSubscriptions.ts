import { createSharedComposable } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import { useShortCart } from "@/shared/cart/composables";
import { getCartSubscriptionItems, removeCartItemSubscription, setCartItemSubscription } from "../api/graphql";
import type { SubscriptionCartItemFieldsFragment, SubscriptionIntervalUnit } from "../api/graphql/types";

function _useCartSubscriptions() {
  const { cart } = useShortCart();
  const { isAuthenticated } = useUser();

  const items = ref<SubscriptionCartItemFieldsFragment[]>([]);
  const loading = ref(false);
  const loadedForCartId = ref<string>();

  const cartId = computed(() => cart.value?.id);
  const byLineItemId = computed(() => new Map(items.value.map((item) => [item.lineItemId, item])));
  const hasSubscriptionItems = computed(() => {
    const lineIds = new Set((cart.value?.items ?? []).map((x) => x.id));
    return items.value.some((item) => lineIds.has(item.lineItemId));
  });

  async function refresh(): Promise<void> {
    if (!cartId.value || !isAuthenticated.value) {
      items.value = [];
      return;
    }

    loading.value = true;
    try {
      items.value = (await getCartSubscriptionItems(cartId.value)) ?? [];
      loadedForCartId.value = cartId.value;
    } catch (e) {
      Logger.error(`${_useCartSubscriptions.name}.${refresh.name}`, e);
    } finally {
      loading.value = false;
    }
  }

  async function setSubscription(
    lineItemId: string,
    planId: string,
    intervalUnit: SubscriptionIntervalUnit,
    intervalCount: number,
  ) {
    if (!cartId.value || !globals.storeId) {
      return;
    }

    const item = await setCartItemSubscription({
      storeId: globals.storeId,
      cartId: cartId.value,
      lineItemId,
      planId,
      intervalUnit,
      intervalCount,
    });

    if (item) {
      items.value = [...items.value.filter((x) => x.lineItemId !== lineItemId), item];
    }
  }

  async function removeSubscription(lineItemId: string) {
    if (!cartId.value) {
      return;
    }

    await removeCartItemSubscription({ cartId: cartId.value, lineItemId });
    items.value = items.value.filter((x) => x.lineItemId !== lineItemId);
  }

  watch(
    [cartId, isAuthenticated],
    ([id]) => {
      if (id && id !== loadedForCartId.value) {
        void refresh();
      }
    },
    { immediate: true },
  );

  return {
    items,
    byLineItemId,
    hasSubscriptionItems,
    loading,
    refresh,
    setSubscription,
    removeSubscription,
  };
}

export const useCartSubscriptions = createSharedComposable(_useCartSubscriptions);
