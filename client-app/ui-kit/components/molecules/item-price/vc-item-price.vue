<template>
  <div class="flex flex-col">
    <div class="flex space-x-1">
      <VcPriceDisplay
        v-if="shouldUseActualPrice(value?.list, value?.actual)"
        class="font-extrabold"
        :class="priceColorClass"
        :value="value?.actual"
      />
      <VcPriceDisplay v-else class="font-bold text-[--price-color]" :value="value?.list" />
      <span class="hidden sm:inline md:hidden xl:inline print:!block">
        {{ $t("common.suffixes.per_item") }}
      </span>
    </div>
    <div class="leading-4">
      <VcPriceDisplay
        v-if="shouldUseActualPrice(value?.list, value?.actual)"
        class="text-xs font-semibold text-neutral-400 line-through"
        :value="value?.list"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shouldUseActualPrice } from "@/ui-kit/utilities/price";
import type { MoneyType, PriceType } from "@/core/api/graphql/types";

interface IProps {
  value?: PriceType | { list: MoneyType; actual: MoneyType };
  priceColorClass?: string;
}

withDefaults(defineProps<IProps>(), {
  priceColorClass: "text-[--price-color]",
});
</script>
