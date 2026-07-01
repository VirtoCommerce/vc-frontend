<template>
  <VcWidget
    id="order-summary"
    class="max-md:mt-5 print:break-inside-avoid"
    :title="$t('common.titles.order_summary')"
    data-test-id="order-summary-widget"
  >
    <slot name="header" />

    <!-- Totals block -->
    <div class="relative">
      <VcLoaderOverlay :visible="changing" />

      <div class="mb-4 flex justify-between text-base font-black">
        <span>{{ $t("common.labels.subtotal") }}</span>

        <span><VcPriceDisplay :value="summarySubTotal!" data-test-id="cart-subtotal-label" /></span>
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
              class="ml-1 fill-primary print:hidden"
              :name="discountsCollapsed ? 'chevron-down' : 'chevron-up'"
              size="xs"
            />
          </component>

          <span v-if="summaryDiscountTotal">
            {{ summaryDiscountTotal?.amount > 0 ? "-" : "" }}
            <VcPriceDisplay :value="summaryDiscountTotal" data-test-id="cart-discount-total-label" />
          </span>
        </div>

        <template v-if="hasDiscounts">
          <div class="print:block" :class="{ hidden: discountsCollapsed }">
            <ul class="list-disc pl-5 text-neutral-400 print:text-[color:var(--color-additional-950)]">
              <li v-for="(discount, index) in cart.discounts" :key="index">
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
            {{ summaryTaxTotal?.amount > 0 ? "+" : "" }}
            <VcPriceDisplay v-if="summaryTaxTotal" :value="summaryTaxTotal" data-test-id="cart-tax-total-label" />
          </span>
        </div>

        <div v-if="!noShipping" class="flex justify-between">
          <span>{{ $t("common.labels.shipping_cost") }}</span>

          <span>
            {{ shippingPrice?.amount > 0 ? "+" : "" }}
            <VcPriceDisplay :value="shippingPrice" data-test-id="shipping-cost-label" />
          </span>
        </div>
      </div>

      <div class="mt-4 flex justify-between text-base font-black">
        <span>{{ $t("common.labels.total") }}</span>

        <span class="text-[--price-color] print:text-inherit">
          <VcPriceDisplay v-if="summaryTotal" :value="summaryTotal" data-test-id="cart-total-label" />
        </span>
      </div>

      <div v-if="otherTotals.length" class="flex flex-col" data-test-id="cart-other-currency-totals">
        <div v-for="total in otherTotals" :key="total.total.currency.code" class="mt-4 border-t pt-4">
          <div class="mb-4 text-base font-black">
            {{ $t("common.labels.total_in_currency", { currency: total.total.currency.code }) }}
          </div>

          <div class="mb-4 flex justify-between text-base font-black">
            <span>{{ $t("common.labels.subtotal") }}</span>

            <span><VcPriceDisplay :value="total.subTotal" /></span>
          </div>

          <div class="border-y py-2 text-base font-normal">
            <div class="flex justify-between">
              <span>{{ $t("common.labels.discount") }}</span>

              <span v-if="total.discountTotal">
                {{ total.discountTotal.amount > 0 ? "-" : "" }}
                <VcPriceDisplay :value="total.discountTotal" />
              </span>
            </div>
          </div>

          <div class="mt-4 flex justify-between text-base font-black">
            <span>{{ $t("common.labels.total") }}</span>

            <span class="text-[--price-color] print:text-inherit">
              <VcPriceDisplay :value="total.total" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <slot name="footer" />

    <div v-if="footnote" class="mt-4 text-xs font-normal text-neutral-500">
      <slot name="footnote">
        {{ $t("common.messages.checkout_pricing_warning") }}
      </slot>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { sumBy } from "lodash";
import { computed, ref } from "vue";
import { useCurrency } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { useFullCart } from "@/shared/cart";
import { useSavedForLater } from "@/shared/cart/composables/useSaveForLater";
import { useCheckout } from "@/shared/checkout/composables/useCheckout";
import type {
  CartTotalType,
  CartType,
  CustomerOrderType,
  DiscountType,
  LineItemType,
  OrderDiscountType,
  OrderLineItemType,
  OrderTotalType,
  OrderShipmentType,
  ShipmentType,
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
const { loading: savedForLaterLoading } = useSavedForLater();

const totals = computed<(CartTotalType | OrderTotalType)[]>(() => {
  if ("cartTotals" in props.cart) {
    return props.cart.cartTotals?.filter((t): t is CartTotalType => !!t) ?? [];
  }
  if ("orderTotals" in props.cart) {
    return props.cart.orderTotals?.filter((t): t is OrderTotalType => !!t) ?? [];
  }
  return [];
});

const defaultTotal = computed(() => totals.value.find((t) => t.isDefaultTotalCurrency));
const otherTotals = computed(() =>
  totals.value.filter((t) => !t.isDefaultTotalCurrency && t.total.currency.code !== props.cart.currency.code),
);

const summarySubTotal = computed(() => defaultTotal.value?.subTotal ?? props.cart.subTotal);
const summaryDiscountTotal = computed(() => defaultTotal.value?.discountTotal ?? props.cart.discountTotal);
const summaryTaxTotal = computed(() => defaultTotal.value?.taxTotal ?? props.cart.taxTotal);
const summaryTotal = computed(() => defaultTotal.value?.total ?? props.cart.total);

const changing = computed(() => cartChanging.value || checkoutChanging.value || savedForLaterLoading.value);

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
