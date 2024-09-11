<template>
  <VcChip :variant="quoteStatus?.variant" :color="quoteStatus?.color || defaultColor" truncate rounded>
    {{ status }}
  </VcChip>
</template>

<script setup lang="ts">
import { inject, computed } from "vue";
import { configInjectionKey } from "@/core/injection-keys";

interface IQuoteStatus {
  code: string;
  color: VcChipColorType;
  variant: VcChipVariantType;
}

interface IProps {
  status?: string;
}

const props = defineProps<IProps>();

const defaultColor = "neutral";
const config = inject(configInjectionKey);
const statuses = config?.quote_statuses || [];

const quoteStatus = computed(() => statuses.find((s: IQuoteStatus) => props.status === s.code));
</script>
