<template>
  <VcCardWidget :title="$t('common.titles.order_summary')" icon="truck">
    <slot name="header"></slot>

    <!-- Totals block -->
    <div>
      <div class="flex justify-between font-extrabold text-base mb-4">
        <span>{{ $t("common.labels.subtotal") }}</span>
        <span><VcPriceDisplay :value="cart.subTotal" /></span>
      </div>

      <div class="py-2 border-t border-b font-normal text-base">
        <div class="flex justify-between" @click="discountsCollapsed = !discountsCollapsed">
          <span class="flex items-center" :class="{ 'cursor-pointer': hasDiscounts }">
            {{ $t("common.labels.discount") }}
            <i
              v-if="hasDiscounts"
              class="fas ml-1 text-[color:var(--color-primary)]"
              :class="discountsCollapsed ? 'fa-caret-up' : 'fa-caret-down'"
            />
          </span>

          <span>
            {{ cart.discountTotal?.amount > 0 ? "-" : "" }}
            <VcPriceDisplay :value="cart.discountTotal" />
          </span>
        </div>

        <div v-if="hasDiscounts && discountsCollapsed">
          <ul class="list-disc pl-5 text-gray-400">
            <li v-for="(discount, index) in cart.discounts" :key="index">
              <div class="flex justify-between items-center">
                <span class="text-sm">{{ discount.description || discount.coupon }}</span>
                <VcTotalDisplay
                  :amount="-getDiscountAmmount(discount)"
                  :currency-code="currentCurrency.code"
                  :culture-name="currentLanguage.cultureName"
                />
              </div>
            </li>

            <li v-if="lineItemsDiscountTotal > 0">
              <div class="flex justify-between items-center">
                <span class="text-sm">{{ $t("common.labels.line_items") }}</span>
                <VcTotalDisplay
                  :amount="-lineItemsDiscountTotal"
                  :currency-code="currentCurrency.code"
                  :culture-name="currentLanguage.cultureName"
                />
              </div>
            </li>
          </ul>
        </div>

        <div class="flex justify-between">
          <span>{{ $t("common.labels.tax") }}</span>
          <span>{{ cart.taxTotal?.amount > 0 ? "+" : "" }}<VcPriceDisplay :value="cart.taxTotal" /></span>
        </div>

        <div class="flex justify-between">
          <span>{{ $t("common.labels.shipping_cost") }}</span>
          <span>{{ cart.shippingTotal?.amount > 0 ? "+" : "" }}<VcPriceDisplay :value="cart.shippingTotal" /></span>
        </div>
      </div>

      <div class="flex justify-between font-extrabold text-base mt-4">
        <span>{{ $t("common.labels.total") }}</span>
        <span class="text-green-700"><VcPriceDisplay :value="cart.total" /></span>
      </div>
    </div>

    <slot name="footer"></slot>
  </VcCardWidget>
</template>

<script setup lang="ts">
import {
  CartType,
  CustomerOrderType,
  DiscountType,
  LineItemType,
  OrderDiscountType,
  OrderLineItemType,
} from "@/xapi/types";
import { computed, PropType, ref } from "vue";
import { sumBy } from "lodash";
import { useCurrency, useLanguages } from "@/core/composables";

const props = defineProps({
  cart: {
    type: Object as PropType<CartType | CustomerOrderType | Record<string, never>>,
    required: true,
  },
});

const { currentLanguage } = useLanguages();
const { currentCurrency } = useCurrency();

const discountsCollapsed = ref(false);

const getDiscountAmmount = (discount: DiscountType | OrderDiscountType) => {
  return typeof discount?.amount === "object" && discount?.amount !== null ? discount?.amount.amount : discount?.amount;
};

const lineItemsDiscountTotal = computed(() =>
  sumBy<LineItemType | OrderLineItemType>(props.cart.items, (item) => item.discountTotal?.amount || 0)
);

const hasDiscounts = computed(() => props.cart.discounts?.length || lineItemsDiscountTotal.value > 0);
</script>

<style scoped></style>
