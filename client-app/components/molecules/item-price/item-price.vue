<template>
  <div class="flex flex-col">
    <div class="flex space-x-1">
      <VcPriceDisplay
        v-if="value?.list?.amount > value?.sale?.amount"
        class="text-green-700 font-extrabold"
        :value="value?.sale"
      />
      <VcPriceDisplay v-else class="text-green-700 font-extrabold" :value="value?.list" />
      <span class="hidden lg:inline" v-t="'common.suffixes.per_item'"></span>
    </div>
    <VcPastPriceDisplay
      class="text-gray-400 text-xs font-semibold"
      v-if="value?.list?.amount > value?.sale?.amount"
      :value="value?.list"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { VcPriceDisplay, VcPastPriceDisplay } from "@/components";
import { PriceType } from "@/core/api/graphql/types";

defineProps({
  value: {
    type: Object as PropType<PriceType>,
    default: undefined,
  },
});
</script>
