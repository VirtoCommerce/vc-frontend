<template>
  <VcChip
    :variant="orderStatus?.variant"
    :color="orderStatus?.color || defaultColor"
    :icon="icon ?? orderStatus?.icon"
    truncate
    rounded
  >
    {{ displayValue || status }}
  </VcChip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import type { IOrderStatus } from "@/core/types";

interface IProps {
  status?: string;
  displayValue?: string;
  icon?: string;
}

const props = defineProps<IProps>();

const { themeContext } = useThemeContext();

const defaultColor = "neutral";
const statuses = themeContext.value?.settings?.orders_statuses || [];

const orderStatus = computed(() => statuses.find((s: IOrderStatus) => props.status === s.code));
</script>
