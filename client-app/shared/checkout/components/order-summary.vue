<template>
  <div class="bg-white rounded border shadow-sm">
    <div class="px-6 py-3 border-b uppercase font-extrabold text-sm">
      <div class="flex">
        <div class="flex-grow text-xl font-extrabold" v-t="'shared.checkout.order_summary.title'"></div>
      </div>
    </div>
    <div class="px-6 py-4">
      <slot name="header"></slot>

      <!-- Totals block -->
      <div>
        <div class="flex justify-between font-extrabold text-base mb-4">
          <span v-t="'shared.checkout.order_summary.subtotal_label'"></span>
          <span><VcPriceDisplay :value="cart.subTotal" /></span>
        </div>
        <div class="py-2 border-t border-b font-normal text-base">
          <div class="flex justify-between" @click="discountsCollapsed = !discountsCollapsed">
            <span class="flex items-center" :class="{ 'cursor-pointer': hasDiscounts }">
              {{ $t("shared.checkout.order_summary.discount_label") }}
              <i
                v-if="hasDiscounts && !discountsCollapsed"
                class="fas fa-caret-down ml-1 text-[color:var(--color-primary)]"
              ></i
              ><i
                v-if="hasDiscounts && discountsCollapsed"
                class="fas fa-caret-up ml-1 text-[color:var(--color-primary)]"
              ></i>
            </span>
            <span>{{ cart.discountTotal?.amount > 0 ? "-" : "" }}<VcPriceDisplay :value="cart.discountTotal" /></span>
          </div>
          <div v-if="hasDiscounts && discountsCollapsed">
            <ul class="list-disc pl-5 text-gray-400">
              <li v-for="(discount, index) in cart.discounts" :key="index">
                <div class="flex justify-between items-center">
                  <span class="text-sm">{{ discount.description }}</span>
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
            <span v-t="'shared.checkout.order_summary.tax_label'"></span>
            <span>{{ cart.taxTotal?.amount > 0 ? "+" : "" }}<VcPriceDisplay :value="cart.taxTotal" /></span>
          </div>
          <div class="flex justify-between">
            <span v-t="'shared.checkout.order_summary.shipping_label'"></span>
            <span>{{ cart.shippingTotal?.amount > 0 ? "+" : "" }}<VcPriceDisplay :value="cart.shippingTotal" /></span>
          </div>
        </div>
        <div class="flex justify-between font-extrabold text-base mt-4">
          <span v-t="'shared.checkout.order_summary.total_label'"></span>
          <span class="text-green-700"><VcPriceDisplay :value="cart.total" /></span>
        </div>
      </div>

      <slot name="footer"></slot>
    </div>
  </div>
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
import _ from "lodash";
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
  _.sumBy(props.cart.items, (item: LineItemType | OrderLineItemType) => item.discountTotal?.amount || 0)
);

const hasDiscounts = computed(() => props.cart.discounts?.length || lineItemsDiscountTotal.value > 0);
</script>

<style scoped></style>
