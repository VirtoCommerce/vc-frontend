<template>
  <div v-if="hasVariations" class="flex items-end gap-1.5">
    <div class="pb-0.5 text-14 text-[color:var(--color-price-from)] lg:text-xs">
      {{ $t("common.suffixes.from") }}
    </div>
    <VcPriceDisplayCatalog :value="value?.actual" class="text-xl font-bold" />
  </div>
  <div
    v-else-if="value?.list && value?.actual && value.list.amount > value.actual.amount"
    class="flex flex-wrap items-end gap-1.5"
  >
    <VcPriceDisplayCatalog :class="priceColorClass" :value="value.actual" class="text-xl font-bold" />
    <VcPriceDisplayCatalog
      :value="value.list"
      class="mb-px pb-0.5 text-xs font-semibold text-[color:var(--color-price-old)]"
      is-old-price
    />
  </div>
  <div v-else class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog :class="priceColorClass" :value="value?.list" class="text-xl font-bold" />
  </div>
</template>

<script setup lang="ts">
import type { MoneyType, PriceType } from "@/core/api/graphql/types";

interface IProps {
  value?: PriceType | { list: MoneyType; actual: MoneyType };
  hasVariations?: boolean;
  priceColorClass?: string;
}

withDefaults(defineProps<IProps>(), {
  priceColorClass: "text-[color:var(--color-price-current)]",
});
</script>
