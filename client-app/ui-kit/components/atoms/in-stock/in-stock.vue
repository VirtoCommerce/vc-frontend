<template>
  <div
    v-if="isInStock"
    class="py-[1px] px-[0.625rem] bg-[color:var(--color-in-stock-available-bg)] text-[color:var(--color-in-stock-available)] whitespace-nowrap rounded-full text-[13px] leading-5"
  >
    <span class="inline-block min-w-[1.438rem] font-bold text-center">{{ quantity > 9999 ? "9999+" : quantity }}</span>
    &nbsp;{{ $t("common.suffixes.product_count_in_stock") }}
  </div>
  <div
    v-else
    class="py-[1px] px-[0.625rem] bg-[color:var(--color-in-stock-out-bg)] text-[color:var(--color-in-stock-out)] whitespace-nowrap rounded-full text-[13px] leading-5"
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
});
</script>
