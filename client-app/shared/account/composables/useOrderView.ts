import { computed, toValue } from "vue";
import { ProductType } from "@/core/enums";
import { groupByVendor, splitLineItemsByCurrency } from "@/core/utilities";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useOrderView(source: MaybeRefOrGetter<CustomerOrderType | undefined>) {
  const order = computed(() => toValue(source));

  const giftItems = computed(() => (order.value?.items || []).filter((item) => item.isGift));
  const orderItems = computed(() => (order.value?.items || []).filter((item) => !item.isGift));

  const lineItemsByCurrency = computed(() => splitLineItemsByCurrency(orderItems.value, order.value?.currency?.code));
  const mainCurrencyOrderItems = computed(() => lineItemsByCurrency.value.mainCurrencyItems);
  const otherCurrencyOrderItemGroups = computed(() => lineItemsByCurrency.value.otherCurrencyGroups);
  const orderItemsGroupedByVendor = computed(() => groupByVendor(mainCurrencyOrderItems.value));

  const allItemsAreDigital = computed(
    () => !!order.value?.items?.every((item) => item.productType === ProductType.Digital),
  );
  const shipment = computed(() => order.value?.shipments?.[0]);
  const payment = computed(() => order.value?.inPayments?.[0]);
  const deliveryAddress = computed(() => shipment.value?.deliveryAddress);
  const pickupLocation = computed(() => shipment.value?.pickupLocation);
  const billingAddress = computed(() => payment.value?.billingAddress);

  return {
    allItemsAreDigital,
    giftItems,
    orderItems,
    mainCurrencyOrderItems,
    otherCurrencyOrderItemGroups,
    orderItemsGroupedByVendor,
    deliveryAddress,
    pickupLocation,
    billingAddress,
    shipment,
    payment,
  };
}
