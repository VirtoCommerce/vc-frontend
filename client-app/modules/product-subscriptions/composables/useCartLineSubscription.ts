import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { useFullCart } from "@/shared/cart";
import { useModal } from "@/shared/modal";
import PurchaseOptionsModal from "../components/purchase-options-modal.vue";
import { addInterval, intervalKey, intervalLabel, parseIntervalKey } from "../utils";
import { useCurrentCartSubscriptions } from "./useCartSubscriptions";
import { useSubscriptionOffers } from "./useSubscriptionOffers";
import type { PreparedLineItemType } from "@/core/types";
import type { MaybeRefOrGetter } from "vue";

/** A cart line's subscription: its offer, the chosen frequency, and the "Purchase options" dialog that changes it. */
export function useCartLineSubscription(lineItemSource: MaybeRefOrGetter<PreparedLineItemType>) {
  const { t } = useI18n();
  const { openModal } = useModal();
  const { forceFetch } = useFullCart();
  const { offerFor } = useSubscriptionOffers();
  const { byLineItemId, setSubscription, removeSubscription } = useCurrentCartSubscriptions();

  const lineItem = computed(() => toValue(lineItemSource));
  const offer = computed(() => offerFor(lineItem.value.productId));
  const subscription = computed(() => byLineItemId.value.get(lineItem.value.id));
  const currentKey = computed(() =>
    subscription.value ? intervalKey(subscription.value.intervalUnit, subscription.value.intervalCount) : undefined,
  );
  const currentLabel = computed(() =>
    subscription.value ? intervalLabel(t, subscription.value.intervalUnit, subscription.value.intervalCount) : "",
  );
  /** Counted from today: the first delivery is the order itself. */
  const nextDelivery = computed(() =>
    subscription.value
      ? addInterval(new Date(), subscription.value.intervalUnit, subscription.value.intervalCount)
      : undefined,
  );

  async function save(key: string | undefined): Promise<void> {
    const planId = offer.value?.planId;
    if (!planId || key === currentKey.value) {
      return;
    }

    if (key) {
      const { unit, count } = parseIntervalKey(key);
      await setSubscription(lineItem.value.id, planId, unit, count);
    } else {
      await removeSubscription(lineItem.value.id);
    }

    await forceFetch();
  }

  function openPurchaseOptions(triggerElement?: HTMLElement): void {
    if (!offer.value) {
      return;
    }

    openModal({
      component: PurchaseOptionsModal,
      props: {
        productName: lineItem.value.name,
        offer: offer.value,
        currentKey: currentKey.value,
        onSave: save,
      },
      triggerElement,
    });
  }

  return { offer, subscription, currentLabel, nextDelivery, openPurchaseOptions };
}
