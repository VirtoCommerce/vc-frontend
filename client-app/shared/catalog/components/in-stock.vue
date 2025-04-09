<template>
  <VcChip v-if="isDigital" :size="size" variant="outline-dark" color="info" rounded>
    {{ $t("common.labels.digital_product") }}
  </VcChip>

  <VcChip
    v-else-if="isInStock && quantity"
    :size="size"
    variant="outline-dark"
    color="success"
    rounded
    :title="$t('common.labels.in_stock')"
  >
    <VcIcon name="cube" />

    <span class="inline-block min-w-3 text-center">
      {{ inStockQuantityLabel }}
    </span>
  </VcChip>

  <VcChip
    v-else
    :size="size"
    variant="outline-dark"
    color="danger"
    rounded
    :title="
      !isAvailable ? $t('common.messages.product_no_longer_available') : $t('common.messages.product_out_of_stock')
    "
  >
    <VcIcon name="cube" />

    <span class="inline-block min-w-3 text-center">0</span>
  </VcChip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MAX_DISPLAY_IN_STOCK_QUANTITY } from "@/core/constants";

interface IProps {
  isInStock?: boolean;
  isAvailable?: boolean;
  isDigital?: boolean;
  quantity?: number | null;
  size?: "xs" | "sm" | "md" | "lg";
  textEnabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  isAvailable: true,
  quantity: null,
  size: "sm",
  textEnabled: true,
});

const inStockQuantityLabel = computed<string>(() =>
  props.quantity && props.quantity > MAX_DISPLAY_IN_STOCK_QUANTITY
    ? `${MAX_DISPLAY_IN_STOCK_QUANTITY}+`
    : props.quantity!.toString(),
);
</script>
