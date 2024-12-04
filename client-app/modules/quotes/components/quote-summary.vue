<template>
  <VcWidget :title="$t('quote_details.quote_summary')">
    <div class="flex justify-between text-base">
      <span class="font-bold">
        {{ $t("quote_details.subTotal") }}
      </span>

      <span class="text-lg font-black text-[--price-color]">
        <VcPriceDisplay :value="quote.totals?.subTotalExlTax" />
      </span>
    </div>
    <div class="border-y py-2 text-base font-normal">
      <div class="flex justify-between text-base">
        {{ $t("quote_details.discountTotal") }}

        <span>
          <VcPriceDisplay :value="quote.totals?.discountTotal" />
        </span>
      </div>
      <div class="flex justify-between text-base">
        {{ $t("quote_details.shippingTotal") }}

        <span>
          <VcPriceDisplay :value="quote.totals?.shippingTotal" />
        </span>
      </div>
      <div class="flex justify-between text-base">
        {{ $t("quote_details.taxTotal") }}

        <span class="">
          <VcPriceDisplay :value="quote.totals?.taxTotal" />
        </span>
      </div>
    </div>
    <div class="flex justify-between text-base">
      <span class="font-bold">
        {{ $t("quote_details.total") }}
      </span>

      <span class="text-lg font-black text-success-700">
        <VcPriceDisplay :value="quote.totals?.grandTotalInclTax" />
      </span>
    </div>

    <slot name="footer" />
  </VcWidget>
</template>

<script setup lang="ts">
import type { QuoteType } from "@/modules/quotes/api/graphql/types";

interface IProps {
  quote: QuoteType;
}

defineProps<IProps>();
</script>
