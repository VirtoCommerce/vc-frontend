<template>
  <VcCardWidget :title="$t('common.titles.order_summary')" icon="truck">
    <slot name="header" />

    <!-- Totals block -->
    <div>
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
            <i
              v-if="hasDiscounts"
              class="fas ml-1 text-[color:var(--color-primary)]"
              :class="discountsCollapsed ? 'fa-caret-up' : 'fa-caret-down'"
            />
          </component>

          <span>{{ cart.discountTotal?.amount > 0 ? "-" : "" }}<VcPriceDisplay :value="cart.discountTotal!" /></span>
        </div>

        <div v-if="hasDiscounts && discountsCollapsed">
          <ul class="list-disc pl-5 text-gray-400">
            <li v-for="(discount, index) in cart.discounts!" :key="index">
              <div class="flex items-center justify-between">
                <span class="text-sm">{{ discount.description || discount.coupon }}</span>
                <VcTotalDisplay
                  :amount="-getDiscountAmmount(discount)"
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
          </ul>
        </div>

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
            {{ cart.shippingTotal?.amount > 0 ? "+" : "" }}
            <VcPriceDisplay :value="cart.shippingTotal!" />
          </span>
        </div>
      </div>

      <div class="mt-4 flex justify-between text-base font-extrabold">
        <span>{{ $t("common.labels.total") }}</span>
        <span class="text-green-700">
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
  </VcCardWidget>
</template>

<script setup lang="ts">
import { sumBy } from "lodash";
import { computed, ref } from "vue";
import { useCurrency, useLanguages } from "@/core/composables";
import type {
  CartType,
  CustomerOrderType,
  DiscountType,
  LineItemType,
  OrderDiscountType,
  OrderLineItemType,
} from "@/core/api/graphql/types";

interface IProps {
  cart: CartType | CustomerOrderType;
  noShipping?: boolean;
  footnote?: boolean;
}

const props = defineProps<IProps>();

const { currentLanguage } = useLanguages();
const { currentCurrency } = useCurrency();

const discountsCollapsed = ref(false);

const getDiscountAmmount = (discount: DiscountType | OrderDiscountType) => {
  return typeof discount?.amount === "object" && discount?.amount !== null ? discount?.amount.amount : discount?.amount;
};

const lineItemsDiscountTotal = computed(() =>
  sumBy<LineItemType | OrderLineItemType>(props.cart.items, (item) => item.discountTotal?.amount || 0),
);

const hasDiscounts = computed(() => props.cart.discounts?.length || lineItemsDiscountTotal.value > 0);
</script>
