<template>
  <div class="vc-line-item-price">
    <div class="vc-line-item-price__actual">
      <VcPriceDisplay :value="listPrice?.amount > actualPrice?.amount ? actualPrice : listPrice" />
    </div>
    <div class="vc-line-item-price__list" v-if="listPrice?.amount > actualPrice?.amount">
      <VcPriceDisplay :value="listPrice" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { MoneyType, PriceType } from "@/xapi/types";

const props = defineProps({
  value: {
    type: Object as PropType<PriceType | { list: MoneyType; actual: MoneyType }>,
    default: undefined,
  },
});

const actualPrice = computed(() => props.value?.actual);
const listPrice = computed(() => props.value?.list);
</script>

<style lang="scss">
.vc-line-item-price {
  &__actual {
    @apply text-13 font-semibold text-[color:var(--color-body-text)];

    @media (min-width: theme("screens.md")) {
      @apply font-normal;
    }

    @media (min-width: theme("screens.lg")) {
      @apply text-xs;
    }

    @media (min-width: theme("screens.xl")) {
      @apply font-medium;
    }
  }

  &__list {
    @apply text-11 leading-3 line-through text-[color:var(--color-price-old)];
  }
}
</style>
