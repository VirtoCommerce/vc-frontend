<template>
  <VcWidget id="order-summary" class="print:break-inside-avoid" :title="$t('common.titles.order_summary')">
    <slot name="header" />

    <!-- Totals block -->
    <div class="relative">
      <VcLoaderOverlay :visible="changing" />

      <div class="mb-4 flex justify-between text-base font-black">
        <span>{{ $t("common.labels.subtotal") }}</span>
        <span><VcPriceDisplay :value="cart.subTotal" /></span>
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
              class="ml-1 text-primary print:hidden"
              :name="discountsCollapsed ? 'chevron-down' : 'chevron-up'"
              size="xs"
            />
          </component>

          <span v-if="cart.discountTotal"><VcPriceDisplay :value="cart.discountTotal" prefix="-" /></span>
        </div>

        <template v-if="hasDiscounts">
          <div class="print:block" :class="{ hidden: discountsCollapsed }">
            <ul class="list-disc pl-5 text-neutral-400 print:text-[color:var(--color-additional-950)]">
              <template v-if="cart.discounts">
                <li v-for="(discount, index) in cart.discounts" :key="index">
                  <div class="flex items-center justify-between">
                    <span class="text-sm">{{ discount.description || discount.coupon }}</span>
                    <VcPriceDisplay :value="getDiscountAmount(discount)" prefix="-" />
                  </div>
                </li>
              </template>

              <li v-if="cart.lineItemDiscountTotal && cart.lineItemDiscountTotal.amount > 0">
                <div class="flex items-center justify-between">
                  <span class="text-sm">{{ $t("common.labels.line_items") }}</span>
                  <span><VcPriceDisplay :value="cart.lineItemDiscountTotal" prefix="-" /></span>
                </div>
              </li>

              <li v-if="cart.shippingDiscountTotal && cart.shippingDiscountTotal.amount > 0">
                <div class="flex items-center justify-between">
                  <span class="text-sm">{{ $t("common.labels.shipping") }}</span>
                  <span><VcPriceDisplay :value="cart.shippingDiscountTotal" prefix="-" /></span>
                </div>
              </li>
            </ul>
          </div>
        </template>

        <div class="flex justify-between">
          <span>{{ $t("common.labels.tax") }}</span>
          <span>
            <VcPriceDisplay v-if="cart.taxTotal" :value="cart.taxTotal" prefix="+" />
          </span>
        </div>

        <div v-if="cart.shippingSubTotal" class="flex justify-between">
          <span>{{ $t("common.labels.shipping_cost") }}</span>
          <span>
            <VcPriceDisplay :value="cart.shippingSubTotal" prefix="+" />
          </span>
        </div>
      </div>

      <div class="mt-4 flex justify-between text-base font-black">
        <span>{{ $t("common.labels.total") }}</span>
        <span class="text-[--price-color] print:text-inherit">
          <VcPriceDisplay v-if="cart.total" :value="cart.total" />
        </span>
      </div>
    </div>

    <slot name="footer" />

    <div v-if="footnote" class="mt-4 text-xs font-normal text-neutral-400">
      <slot name="footnote">
        {{ $t("common.messages.checkout_pricing_warning") }}
      </slot>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { DiscountType, OrderDiscountType, MoneyType } from "@/core/api/graphql/types";

interface IProps {
  changing?: boolean;
  cart: {
    lineItemDiscountTotal?: MoneyType;
    shippingDiscountTotal?: MoneyType;
    discounts?: DiscountType[] | OrderDiscountType[];
    discountTotal: MoneyType;
    taxTotal: MoneyType;
    shippingSubTotal?: MoneyType;
    subTotal: MoneyType;
    total: MoneyType;
  };
  noShipping?: boolean;
  footnote?: boolean;
}

const props = defineProps<IProps>();

const discountsCollapsed = ref(true);

const hasDiscounts = computed(
  () =>
    props.cart.discounts?.length ||
    props.cart.lineItemDiscountTotal?.amount ||
    props.cart.shippingDiscountTotal?.amount,
);

function getDiscountAmount(discount: DiscountType | OrderDiscountType): MoneyType {
  return "moneyAmount" in discount ? discount.moneyAmount : discount.amount;
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
