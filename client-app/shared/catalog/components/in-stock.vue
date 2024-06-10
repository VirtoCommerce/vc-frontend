<template>
  <VcChip v-if="isDigital" :size="size" variant="outline-dark" color="info" rounded>
    {{ $t("common.labels.digital_product") }}
  </VcChip>

  <VcChip v-else-if="isInStock" :size="size" variant="outline-dark" color="success" rounded>
    <span v-if="quantity" class="inline-block min-w-5 text-center">
      {{ inStockQuantityLabel }}
    </span>

    <span v-if="textEnabled">
      {{ quantity ? $t("common.suffixes.product_count_in_stock") : $t("common.labels.in_stock") }}
    </span>
  </VcChip>

  <VcChip v-else-if="!isAvailable" :size="size" variant="outline-dark" color="danger" rounded>
    {{ $t("common.messages.product_no_longer_available") }}
  </VcChip>

  <VcChip v-else :size="size" variant="outline-dark" color="danger" rounded>
    {{ $t("common.messages.product_out_of_stock") }}
  </VcChip>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
  size: "xs",
  textEnabled: true,
});

const MAX_DISPLAY_IN_STOCK_QUANTITY = 9999;

const inStockQuantityLabel = computed<string>(() =>
  props.quantity && props.quantity > MAX_DISPLAY_IN_STOCK_QUANTITY
    ? `${MAX_DISPLAY_IN_STOCK_QUANTITY}+`
    : props.quantity!.toString(),
);
</script>
