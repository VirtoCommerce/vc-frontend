<template>
  <VcWidget id="order-summary" :title="$t('common.titles.order_summary')">
    <slot name="header" />

    <!-- Totals block -->
    <div class="relative">
      <VcLoaderOverlay :visible="changing" />

      <div class="mb-4 flex justify-between text-base font-extrabold">
        <span>{{ $t("common.labels.subtotal") }}</span>
        <span><VcPriceDisplay :value="cart.subTotal!" /></span>
      </div>

      <div class="border-y py-2 text-base font-normal">
        <div class="flex justify-between">
          <component
            :is="hasDiscounts ? 'button' : 'span'"
            class="flex appearance-none items-center"
            @click="discountsCollapsed = !discountsCollapsed"
          >
            {{ $t("common.labels.discount") }}
            <VcIcon
              v-if="hasDiscounts"
              class="ml-1 text-[--color-primary-500] print:hidden"
              :name="discountsCollapsed ? 'chevron-down' : 'chevron-up'"
              size="xs"
            />
          </component>

          <span>{{ cart.discountTotal?.amount > 0 ? "-" : "" }}<VcPriceDisplay :value="cart.discountTotal!" /></span>
        </div>

        <template v-if="hasDiscounts">
          <div class="print:block" :class="{ hidden: discountsCollapsed }">
            <ul class="list-disc pl-5 text-gray-400 print:text-[color:var(--color-additional-950)]">
              <li v-for="(discount, index) in cart.discounts!" :key="index">
                <div class="flex items-center justify-between">
                  <span class="text-sm">{{ discount.description || discount.coupon }}</span>
                  <VcTotalDisplay
                    :amount="-getDiscountAmount(discount)"
                    :currency-code="currentCurrency.code"
                    :culture-name="currentLanguage.cultureName"
                  />
                </div>
              </li>

              <li v-if="lineItemsDiscountTotal > 0">
                <div class="flex items-center justify-between">
                  <span class="text-sm">{{ $t("common.labels.line_items") }}</span>
                  <VcTotalDisplay
                    :amount="-lineItemsDiscountTotal"
                    :currency-code="currentCurrency.code"
                    :culture-name="currentLanguage.cultureName"
                  />
                </div>
              </li>

              <li v-if="shippingDiscountTotal > 0">
                <div class="flex items-center justify-between">
                  <span class="text-sm">{{ $t("common.labels.shipping") }}</span>
                  <VcTotalDisplay
                    :amount="-shippingDiscountTotal"
                    :currency-code="currentCurrency.code"
                    :culture-name="currentLanguage.cultureName"
                  />
                </div>
              </li>
            </ul>
          </div>
        </template>

        <div class="flex justify-between">
          <span>{{ $t("common.labels.tax") }}</span>
          <span>
            {{ cart.taxTotal?.amount > 0 ? "+" : "" }}
            <VcPriceDisplay :value="cart.taxTotal!" />
          </span>
        </div>

        <div v-if="!noShipping" class="flex justify-between">
          <span>{{ $t("common.labels.shipping_cost") }}</span>
          <span>
            {{ shippingPrice?.amount > 0 ? "+" : "" }}
            <VcPriceDisplay :value="shippingPrice" />
          </span>
        </div>
      </div>

      <div class="mt-4 flex justify-between text-base font-extrabold">
        <span>{{ $t("common.labels.total") }}</span>
        <span class="text-[--price-color] print:text-inherit">
          <VcPriceDisplay :value="cart.total!" />
        </span>
      </div>
    </div>

    <slot name="footer" />

    <div v-if="footnote" class="mt-4 text-xs font-normal text-gray-400">
      <slot name="footnote">
        {{ $t("common.messages.checkout_pricing_warning") }}
      </slot>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { sumBy } from "lodash";
import { computed, ref } from "vue";
import { useCurrency, useLanguages } from "@/core/composables";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";
import type {
  OrderShipmentType,
  CartType,
  CustomerOrderType,
  LineItemType,
  OrderLineItemType,
  ShipmentType,
  DiscountType,
  OrderDiscountType,
} from "@/core/api/graphql/types";

interface IProps {
  cart: CartType | CustomerOrderType;
  selectedItems?: LineItemType[];
  noShipping?: boolean;
  footnote?: boolean;
}

const props = defineProps<IProps>();

const { currentLanguage } = useLanguages();
const { currentCurrency } = useCurrency();
const { changing: cartChanging } = useFullCart();
const { changing: checkoutChanging } = useCheckout();

const changing = computed(() => cartChanging.value || checkoutChanging.value);

const discountsCollapsed = ref(true);

const lineItemsDiscountTotal = computed(() =>
  sumBy<LineItemType | OrderLineItemType>(
    props.selectedItems ?? props.cart.items,
    (item) => item.discountTotal?.amount ?? 0,
  ),
);

// TODO: Change to shippingPrice when this property will be added to CustomerOrderType
const shippingPrice = computed(() =>
  "shippingPrice" in props.cart ? props.cart.shippingPrice : props.cart.shippingSubTotal,
);

const shippingDiscountTotal = computed(() =>
  sumBy<ShipmentType | OrderShipmentType>(props.cart.shipments, (shipment) => shipment.discountAmount?.amount),
);

const hasDiscounts = computed(
  () => props.cart.discounts?.length || lineItemsDiscountTotal.value > 0 || shippingDiscountTotal.value > 0,
);

// TODO: Need to remove this function because type of cart discount amount should be equal to order discount amount
function getDiscountAmount(discount: DiscountType | OrderDiscountType): number {
  return typeof discount?.amount === "object" && discount?.amount !== null ? discount?.amount.amount : discount?.amount;
}
</script>

<style scoped lang="scss">
@media print {
  #order-summary {
    :deep(.vc-widget__header-container) {
      @apply hidden;
    }
  }
}
</style>
