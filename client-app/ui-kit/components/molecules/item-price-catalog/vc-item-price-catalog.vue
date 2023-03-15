<template>
  <div v-if="variationsMinPrice" class="flex items-end gap-1.5">
    <div v-t="'common.suffixes.from'" class="pb-0.5 text-14 text-[color:var(--color-price-from)] lg:text-xs"></div>
    <VcPriceDisplayCatalog class="text-xl font-bold" :value="variationsMinPrice" />
  </div>
  <div v-else-if="value?.list?.amount > value?.actual?.amount" class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog class="text-xl font-bold" :class="priceColorClass" :value="value?.actual" />
    <VcPriceDisplayCatalog
      class="mb-px pb-0.5 text-xs font-semibold text-[color:var(--color-price-old)]"
      :value="value?.list"
      is-old-price
    />
  </div>
  <div v-else class="flex flex-wrap items-end gap-1.5">
    <VcPriceDisplayCatalog class="text-xl font-bold" :class="priceColorClass" :value="value?.list" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MoneyType, PriceType, VariationType } from "@/xapi/types";
import type { PropType } from "vue";

const props = defineProps({
  value: {
    type: Object as PropType<PriceType | { list: MoneyType; actual: MoneyType }>,
    default: undefined,
  },

  variations: {
    type: Array as PropType<VariationType[]>,
    default: undefined,
  },

  priceColorClass: {
    type: String,
    default: "text-[color:var(--color-price-current)]",
  },
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
