<template>
  <VcTooltip class="order-status">
    <template #trigger>
      <VcChip
        :variant="orderStatus?.variant"
        :color="orderStatus?.color || defaultColor"
        :icon="icon ?? orderStatus?.icon"
        :truncate="truncate"
        rounded
      >
        <span>{{ displayValue || status }}</span>
      </VcChip>
    </template>

    <template #content>
      {{ displayValue || status }}
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import type { IOrderStatus } from "@/core/types";

interface IProps {
  status?: string;
  displayValue?: string;
  icon?: string;
  truncate?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  truncate: true,
});

const { themeContext } = useThemeContext();

const defaultColor = "neutral";

const statusMap = computed(() => {
  const map = new Map<string, IOrderStatus>();

  themeContext.value?.settings?.orders_statuses?.forEach((status) => {
    map.set(String(status.code).toLowerCase(), status);
  });

  return map;
});

const orderStatus = computed(() => statusMap.value.get(String(props.status).toLowerCase()));
</script>

<style lang="scss">
.order-status {
  @apply min-w-0 max-w-full;
}
</style>
