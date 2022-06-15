<template>
  <div class="flex flex-col">
    <div class="flex space-x-1">
      <VcPriceDisplay
        v-if="value?.list?.amount > value?.sale?.amount"
        class="font-extrabold"
        :class="priceColorClass"
        :value="value?.sale"
      />
      <VcPriceDisplay v-else class="text-green-700 font-extrabold" :value="value?.list" />
      <span class="hidden sm:inline md:hidden xl:inline" v-t="'common.suffixes.per_item'"></span>
    </div>
    <div class="leading-4">
      <VcPriceDisplay
        class="text-gray-400 text-xs font-semibold line-through"
        v-if="value?.list?.amount > value?.sale?.amount"
        :value="value?.list"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { MoneyType, PriceType } from "@/xapi/graphql/types";

defineProps({
  value: {
    type: Object as PropType<PriceType | { list: MoneyType; sale: MoneyType }>,
    default: undefined,
  },
  priceColorClass: {
    type: String,
    default: "text-[color:var(--color-price)]",
  },
});
</script>
