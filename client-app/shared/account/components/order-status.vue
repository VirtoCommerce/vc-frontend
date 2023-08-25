<template>
  <VcBadge :variant="orderStatus?.variant" :color="orderStatus?.color || defaultColor" truncate>
    {{ status }}
  </VcBadge>
</template>

<script setup lang="ts">
import { inject, computed } from "vue";
import { configInjectionKey } from "@/core/injection-keys";
import type { IOrderStatus } from "@/core/types";

interface IProps {
  status?: string;
}

const props = defineProps<IProps>();

const defaultColor = "neutral";
const config = inject(configInjectionKey);
const statuses = config?.orders_statuses || [];

const orderStatus = computed(() => statuses.find((s: IOrderStatus) => props.status === s.code));
</script>
