<template>
  <VcWidget id="order-summary" class="print:break-inside-avoid" :title="title ?? $t('common.titles.order_summary')">
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
            <VcPriceDisplay v-if="cart.taxTotal" :value="cart.taxTotal" prefix="+" />
          </span>
        </div>

        <div v-if="!noShipping && shippingPrice" class="flex justify-between">
          <span>{{ $t("common.labels.shipping_cost") }}</span>
          <span>
            <VcPriceDisplay :value="shippingPrice" prefix="+" />
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
import { sumBy } from "lodash";
import { computed, ref } from "vue";
import { useCurrency } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import type { MoneyType, DiscountType, OrderDiscountType } from "@/core/api/graphql/types";

interface IHasDiscountAmount {
  id: string;
  discountAmount?: MoneyType;
}

interface IHasDiscountTotal {
  id: string;
  discountTotal?: MoneyType;
}

interface ICart extends IHasDiscountTotal {
  discounts?: DiscountType[] | OrderDiscountType[];
  items: IHasDiscountTotal[];
  shipments?: IHasDiscountAmount[];
  shippingPrice?: MoneyType;
  shippingSubTotal?: MoneyType;
  subTotal: MoneyType;
  taxTotal: MoneyType;
  total: MoneyType;
}

interface IProps {
  title?: string;
  changing?: boolean;
  cart: ICart;
  selectedItems?: IHasDiscountTotal[];
  noShipping?: boolean;
  footnote?: boolean;
}

const props = defineProps<IProps>();

const { currentLanguage } = useLanguages();
const { currentCurrency } = useCurrency();

const discountsCollapsed = ref(true);

const lineItemsDiscountTotal = computed(() =>
  sumBy(props.selectedItems ?? props.cart.items, (item) => item.discountTotal?.amount ?? 0),
);

// TODO: Change to shippingSubTotal when this property will be added to CartType
const shippingPrice = computed(() =>
  "shippingPrice" in props.cart ? props.cart.shippingPrice : props.cart.shippingSubTotal,
);

const shippingDiscountTotal = computed(() =>
  sumBy(props.cart.shipments, (shipment) => shipment.discountAmount?.amount ?? 0),
);

const hasDiscounts = computed(
  () => props.cart.discounts?.length || lineItemsDiscountTotal.value > 0 || shippingDiscountTotal.value > 0,
);

// TODO: Need to remove this function because type of cart discount amount should be equal to order discount amount
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
