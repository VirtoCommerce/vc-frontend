import { computed, toValue } from "vue";
import { OrderStatusCode } from "@/core/constants/order-status";
import { ProductType } from "@/core/enums";
import { globals } from "@/core/globals";
import { groupByVendor, splitLineItemsByCurrency } from "@/core/utilities";
import { BOPIS_CODE } from "@/shared/checkout/composables/useBopis";
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

  const isCancelled = computed(
    () => String(order.value?.status).toLowerCase() === String(OrderStatusCode.CANCELLED).toLowerCase(),
  );

  // Read through `globals` per evaluation rather than useI18n(): useUserOrder calls this composable at
  // module scope, where there is neither a setup context nor a populated `globals` yet.
  const shipmentMethodName = computed<string>(() =>
    globals.i18n.global.t(
      `common.methods.delivery_by_id.${shipment.value?.shipmentMethodCode}_${shipment.value?.shipmentMethodOption}`,
    ),
  );

  const paymentMethodName = computed(() => payment.value?.paymentMethod?.name);

  const shipToTitle = computed(() =>
    shipment.value?.shipmentMethodCode === BOPIS_CODE
      ? globals.i18n.global.t("pages.account.order_details.bopis.pickup_address")
      : globals.i18n.global.t("common.titles.shipping_address"),
  );

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
    isCancelled,
    shipmentMethodName,
    paymentMethodName,
    shipToTitle,
  };
}
