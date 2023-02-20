<template>
  <div
    v-if="discount"
    class="absolute top-0 left-0 z-[1] flex items-center space-x-1.5 rounded-tl rounded-br bg-[color:var(--color-sale-badge-bg)] py-0.5 text-white"
    :class="{
      'h-7 px-2 lg:h-6 lg:px-1.5': size === 'md',
      'h-5 px-1.5': size === 'sm',
    }"
  >
    <svg v-if="isHot" class="h-3 w-2.5">
      <use href="/static/images/fire-solid.svg#main" />
    </svg>
    <span
      class="font-extrabold lg:text-11"
      :class="{
        'hidden lg:block': isHot && size === 'sm',
        'text-10': !isHot && size === 'sm',
        'text-13': size === 'md',
      }"
    >
      {{ discount }} {{ $t("shared.catalog.discount_badge.off") }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/shared";
import { PropType } from "vue";
import { PriceType } from "@/xapi/types";

const props = defineProps({
  price: {
    type: Object as PropType<PriceType>,
    required: true,
  },

  isHot: {
    type: Boolean,
    default: false,
  },

  size: {
    type: String,
    default: "md",
  },
});

const discount = computedEager<string | null>(() =>
  props.price.discountPercent >= 0.05 ? `${Math.round(props.price.discountPercent * 100)}%` : null
);
</script>
