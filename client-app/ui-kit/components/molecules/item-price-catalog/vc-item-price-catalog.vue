<template>
  <div v-if="variationsMinPrice" class="flex items-end gap-1.5">
    <div v-t="'common.suffixes.from'" class="pb-0.5 text-14 text-[color:var(--color-price-from)] lg:text-xs"></div>
    <VcPriceDisplayCatalog :value="variationsMinPrice" class="text-xl font-bold" />
  </div>
  <div v-else-if="value?.list?.amount > value?.actual?.amount" class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog :class="priceColorClass" :value="value?.actual" class="text-xl font-bold" />
    <VcPriceDisplayCatalog
      :value="value?.list"
      class="mb-px pb-0.5 text-xs font-semibold text-[color:var(--color-price-old)]"
      is-old-price
    />
  </div>
  <div v-else class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog :class="priceColorClass" :value="value?.list" class="text-xl font-bold" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MoneyType, PriceType, VariationType } from "@/core/api/graphql/types";

interface IProps {
  value?: PriceType | { list: MoneyType; actual: MoneyType };
  variations?: VariationType[];
  priceColorClass?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  priceColorClass: "text-[color:var(--color-price-current)]",
});

const variationsMinPrice = computed(() => {
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
});
</script>
