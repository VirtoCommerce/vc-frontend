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
const statuses = themeContext.value?.settings?.orders_statuses || [];

const orderStatus = computed(() => statuses.find((s: IOrderStatus) => props.status === s.code));
</script>

<style lang="scss">
.order-status {
  @apply min-w-0 max-w-full;
}
</style>
