<template>
  <div
    v-if="isDigital"
    class="badge__digital whitespace-nowrap rounded-full px-[0.625rem] py-[1px] text-[13px] leading-5 lg:text-[11px]"
  >
    {{ $t("common.labels.digital_product") }}
  </div>

  <div
    v-else-if="isInStock"
    class="whitespace-nowrap rounded-full bg-[color:var(--color-in-stock-available-bg)] px-[0.677rem] py-0.5 text-[13px] leading-5 text-[color:var(--color-in-stock-available)] lg:px-[0.53rem] lg:py-px lg:text-[11px]"
  >
    <div v-if="quantity">
      <span class="inline-block min-w-[1.438rem] text-center font-bold lg:min-w-[1.25rem]">
        {{ inStockQuantityLabel }}
      </span>
      {{ $t("common.suffixes.product_count_in_stock") }}
    </div>

    <div v-else>
      {{ $t("common.labels.in_stock") }}
    </div>
  </div>

  <div
    v-else-if="!isAvailable"
    class="whitespace-nowrap rounded-full bg-[color:var(--color-in-stock-out-bg)] px-[0.625rem] py-[1px] text-[13px] leading-5 text-[color:var(--color-in-stock-out)] lg:text-[11px]"
  >
    {{ $t("common.messages.product_no_longer_available") }}
  </div>

  <div
    v-else
    class="whitespace-nowrap rounded-full bg-[color:var(--color-in-stock-out-bg)] px-[0.625rem] py-[1px] text-[13px] leading-5 text-[color:var(--color-in-stock-out)] lg:text-[11px]"
  >
    {{ $t("common.messages.product_out_of_stock") }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  isInStock?: boolean;
  isAvailable?: boolean;
  isDigital?: boolean;
  quantity?: number | null;
}

const props = withDefaults(defineProps<IProps>(), {
  isAvailable: true,
  quantity: null,
});

const MAX_DISPLAY_IN_STOCK_QUANTITY = 9999;

const inStockQuantityLabel = computed<string>(() =>
  props.quantity && props.quantity > MAX_DISPLAY_IN_STOCK_QUANTITY
    ? `${MAX_DISPLAY_IN_STOCK_QUANTITY}+`
    : props.quantity!.toString(),
);
</script>

<!-- TODO: Replace this temporary solution with an actual markup requirements -->
<style scoped lang="scss">
.badge {
  &__digital {
    background-color: #ecf6ff;
    color: #327393;
  }
}
</style>
