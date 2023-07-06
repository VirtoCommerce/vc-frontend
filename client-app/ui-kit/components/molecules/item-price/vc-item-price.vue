<template>
  <div class="flex flex-col">
    <div class="flex space-x-1">
      <VcPriceDisplay
        v-if="listPrice?.amount > actualPrice?.amount"
        :class="priceColorClass"
        :value="actualPrice"
        class="font-extrabold"
      />
      <VcPriceDisplay v-else :value="listPrice" class="font-bold text-green-700" />
      <span class="hidden print:!block sm:inline md:hidden xl:inline">
        {{ $t("common.suffixes.per_item") }}
      </span>
    </div>
    <div class="leading-4">
      <VcPriceDisplay
        v-if="listPrice?.amount > actualPrice?.amount"
        :value="listPrice"
        class="text-xs font-semibold text-gray-400 line-through"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePrice } from "@/core/composables";
import type { MoneyType, PriceType } from "@/core/api/graphql/types";

interface IProps {
  value?: PriceType | { list: MoneyType; listWithTax: MoneyType; actual: MoneyType; actualWithTax: MoneyType };
  priceColorClass?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  priceColorClass: "text-[color:var(--color-price)]",
});

const { listPrice, actualPrice } = usePrice(props.value);
</script>
