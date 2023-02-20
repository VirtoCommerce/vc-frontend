<template>
  <div
    v-if="isInStock"
    class="whitespace-nowrap rounded-full bg-[color:var(--color-in-stock-available-bg)] py-0.5 px-[0.677rem] text-[13px] leading-5 text-[color:var(--color-in-stock-available)] lg:py-px lg:px-[0.53rem] lg:text-[11px]"
  >
    <span class="inline-block min-w-[1.438rem] text-center font-bold lg:min-w-[1.25rem]">{{
      quantity > 9999 ? "9999+" : quantity
    }}</span>
    {{ $t("common.suffixes.product_count_in_stock") }}
  </div>
  <div
    v-else-if="!isAvailable"
    class="whitespace-nowrap rounded-full bg-[color:var(--color-in-stock-out-bg)] py-[1px] px-[0.625rem] text-[13px] leading-5 text-[color:var(--color-in-stock-out)] lg:text-[11px]"
  >
    {{ $t("common.messages.product_no_longer_available") }}
  </div>
  <div
    v-else
    class="whitespace-nowrap rounded-full bg-[color:var(--color-in-stock-out-bg)] py-[1px] px-[0.625rem] text-[13px] leading-5 text-[color:var(--color-in-stock-out)] lg:text-[11px]"
  >
    {{ $t("common.messages.product_out_of_stock") }}
  </div>
</template>

<script setup lang="ts">
defineProps({
  isInStock: {
    type: Boolean,
    default: false,
  },

  quantity: {
    type: Number,
    default: null,
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },
});
</script>
