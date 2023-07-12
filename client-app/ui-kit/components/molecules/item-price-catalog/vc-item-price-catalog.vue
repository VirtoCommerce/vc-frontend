<template>
  <div v-if="variationsMinPrice" class="flex items-end gap-1.5">
    <div v-t="'common.suffixes.from'" class="pb-0.5 text-14 text-[color:var(--color-price-from)] lg:text-xs"></div>
    <VcPriceDisplayCatalog :value="variationsMinPrice" class="text-xl font-bold" />
  </div>
  <div v-else-if="listPrice?.amount > actualPrice?.amount" class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog :class="priceColorClass" :value="actualPrice" class="text-xl font-bold" />
    <VcPriceDisplayCatalog
      :value="listPrice"
      class="mb-px pb-0.5 text-xs font-semibold text-[color:var(--color-price-old)]"
      is-old-price
    />
  </div>
  <div v-else class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog :class="priceColorClass" :value="listPrice" class="text-xl font-bold" />
  </div>
</template>

<script setup lang="ts">
import { minBy } from "lodash";
import { computed } from "vue";
import { useCatalogPrice, useThemeContext } from "@/core/composables";
import type { MoneyType, PriceType, VariationType } from "@/core/api/graphql/types";

interface IProps {
  value?: PriceType | { list: MoneyType; listWithTax: MoneyType; actual: MoneyType; actualWithTax: MoneyType };
  variations?: VariationType[];
  priceColorClass?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  priceColorClass: "text-[color:var(--color-price-current)]",
});

const { listPrice, actualPrice } = useCatalogPrice(props.value);

const { themeContext } = useThemeContext();

const { show_prices_with_taxes } = themeContext.value.settings;

const variationsMinPrice = computed<MoneyType | undefined>(() => {
  const variationWithMinPrice: VariationType | undefined = minBy(props.variations, (variation) =>
    show_prices_with_taxes ? variation.price?.actualWithTax : variation.price?.actual
  );

  return show_prices_with_taxes ? variationWithMinPrice?.price?.actualWithTax : variationWithMinPrice?.price?.actual;
});
</script>
