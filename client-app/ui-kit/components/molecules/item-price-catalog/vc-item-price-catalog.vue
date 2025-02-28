<template>
  <div v-if="hasVariations" class="flex items-end gap-1.5">
    <div class="pb-0.5 text-sm text-neutral lg:text-xs">
      {{ $t("ui_kit.suffixes.from") }}
    </div>
    <VcPriceDisplayCatalog :value="value?.actual" class="text-xl font-bold" />
  </div>
  <div v-else-if="isConfigurable" class="flex items-end gap-1.5">
    <div class="pb-0.5 text-sm text-neutral lg:text-xs">
      {{ $t("ui_kit.suffixes.from") }}
    </div>
    <VcPriceDisplayCatalog :class="priceColorClass" :value="value?.list" class="text-xl font-bold" />
  </div>
  <div v-else-if="shouldUseActualPrice(value?.list, value?.actual)" class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog :class="priceColorClass" :value="value?.actual" class="text-xl font-bold" />
    <VcPriceDisplayCatalog :value="value?.list" class="mb-px pb-0.5 text-xs font-bold text-neutral" is-old-price />
  </div>
  <div v-else class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog :class="priceColorClass" :value="value?.list" class="text-xl font-bold" />
  </div>
</template>

<script setup lang="ts">
import { shouldUseActualPrice } from "@/ui-kit/utilities/price";
import type { MoneyType, PriceType } from "@/core/api/graphql/types";

interface IProps {
  value?: PriceType | { list: MoneyType; actual: MoneyType };
  hasVariations?: boolean;
  isConfigurable?: boolean;
  priceColorClass?: string;
}

withDefaults(defineProps<IProps>(), {
  priceColorClass: "text-neutral-900",
});
</script>
