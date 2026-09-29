<template>
  <VcChip v-if="isDigital" :size="size" variant="outline-dark" color="info" rounded>
    <VcIcon name="cloud" variant="solid" />

    {{ $t("common.labels.digital_product") }}
  </VcChip>

  <VcChip
    v-else-if="isInStock"
    :size="size"
    variant="outline-dark"
    :color="flagLowStock && isLowStock ? 'danger' : 'success'"
    rounded
    :title="$t('common.labels.in_stock')"
  >
    <VcIcon name="cube" variant="solid" />

    <span class="inline-block min-w-3 text-center">
      <template v-if="labeled && quantity">
        {{ isLowStock ? $t("shared.catalog.product_card.low_stock") : $t("common.labels.in_stock") }}:
        {{ inStockQuantityLabel }}
      </template>

      <template v-else>{{ quantity ? inStockQuantityLabel : $t("common.labels.in_stock") }}</template>
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
    <VcIcon name="cube" variant="solid" />

    <span class="inline-block min-w-3 text-center">
      {{ labeled ? $t("common.messages.product_out_of_stock") : 0 }}
    </span>
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
  size?: VcChipSizeType;
  textEnabled?: boolean;
  /** Name the state beside the count — "In stock: 142" — where no column heading says what it counts. */
  labeled?: boolean;
  /** Turn the chip red at a low count, as the catalog does; elsewhere a low count is still in stock. */
  flagLowStock?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  isAvailable: true,
  quantity: null,
  size: "sm",
  textEnabled: true,
});

/** At or under this many, the stock is low: "Low stock: 4". */
const LOW_STOCK_THRESHOLD = 10;

const isLowStock = computed(() => !!props.quantity && props.quantity <= LOW_STOCK_THRESHOLD);

const inStockQuantityLabel = computed<string>(() =>
  props.quantity && props.quantity > MAX_DISPLAY_IN_STOCK_QUANTITY
    ? `${MAX_DISPLAY_IN_STOCK_QUANTITY}+`
    : props.quantity!.toString(),
);
</script>
