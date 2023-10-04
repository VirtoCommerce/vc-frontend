<template>
  <span v-if="minQty && maxQty">
    {{ $t("common.labels.order_from_to_items", [minQty, maxQty]) }}
  </span>
  <span v-else-if="minQty">
    {{ $t("common.labels.min_order_items", [minQty]) }}
  </span>
  <span v-else-if="maxQty">
    {{ $t("common.labels.max_order_items", [maxQty]) }}
  </span>
</template>

<script setup lang="ts">
interface IProps {
  minQty?: number;
  maxQty?: number;
}

defineProps<IProps>();
</script>
