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
import { useThemeContext } from "@/core/composables";
import type { MoneyType, PriceType, VariationType } from "@/core/api/graphql/types";

interface IProps {
  value?: PriceType | { list: MoneyType; listWithTax: MoneyType; actual: MoneyType; actualWithTax: MoneyType };
  variations?: VariationType[];
  priceColorClass?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  priceColorClass: "text-[color:var(--color-price-current)]",
});

const { themeContext } = useThemeContext();

const { show_prices_with_taxes } = themeContext.value.settings;

const actualPrice = computed<MoneyType | undefined>(() =>
  show_prices_with_taxes ? props.value?.actualWithTax : props.value?.actual
);
const listPrice = computed<MoneyType | undefined>(() =>
  show_prices_with_taxes ? props.value?.listWithTax : props.value?.list
);
const variationsMinPrice = computed<MoneyType | undefined>(() => {
  const variationWithMinPrice: VariationType | undefined = minBy(props.variations, (variation) =>
    show_prices_with_taxes ? variation.price?.actualWithTax : variation.price?.actual
  );

  return show_prices_with_taxes ? variationWithMinPrice?.price?.actualWithTax : variationWithMinPrice?.price?.actual;
});

/*const variationsMinPrice = computed(() => {
  if (props.variations?.length) {
    let min = props.variations[0].price?.actual;
    let tmp;
    for (let i = 1; i <= props.variations.length - 1; i++) {
      tmp = props.variations[i].price?.actual;
      if (tmp?.amount < min?.amount) {
        min = tmp;
      }
    }
    return min;
  }

  return null;
});*/
</script>
