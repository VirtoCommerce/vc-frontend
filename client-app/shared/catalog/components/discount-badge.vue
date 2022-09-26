<template>
  <div
    v-if="discount"
    class="absolute z-[1] top-0 right-0 px-2 pt-1 pb-1.5 rounded-bl bg-[color:var(--color-sale-badge-bg)] text-white text-xs font-extrabold"
  >
    {{ discount }}
  </div>
</template>

<script setup lang="ts">
import { PriceType } from "@/xapi/types";
import { computedEager } from "@vueuse/shared";
import { PropType } from "vue";

const props = defineProps({
  price: {
    type: Object as PropType<PriceType>,
    required: true,
  },
});

const discount = computedEager<string | null>(() =>
  props.price.discountPercent >= 0.05 ? `-${Math.round(props.price.discountPercent * 100)}%` : null
);
</script>
