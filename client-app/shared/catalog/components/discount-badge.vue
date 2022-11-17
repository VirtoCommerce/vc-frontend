<template>
  <div
    v-if="discount"
    class="z-[1] absolute top-0 left-0 flex items-center py-1 px-2 rounded-tl rounded-br bg-[color:var(--color-sale-badge-bg)] text-white space-x-1.5 lg:px-1.5"
  >
    <svg class="w-2.5 h-3" v-if="isHot">
      <use href="/static/images/fire-solid.svg#main" />
    </svg>
    <span
      class="text-13 font-extrabold lg:text-11"
      :class="{
        'hidden lg:block': isHot && viewMode === 'list',
      }"
    >
      {{ discount }} {{ $t("shared.catalog.discount_badge.off") }}
    </span>
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
  isHot: {
    type: Boolean,
    default: true,
  },
  viewMode: {
    type: String,
    default: "grid",
  },
});

const discount = computedEager<string | null>(() =>
  props.price.discountPercent >= 0.05 ? `${Math.round(props.price.discountPercent * 100)}%` : null
);
</script>
