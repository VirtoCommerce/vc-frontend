<template>
  <VcBadge
    class="w-full max-w-[7.875rem]"
    :variant="quoteStatus?.variant"
    :color="quoteStatus?.color || defaultColor"
    truncate
  >
    {{ status }}
  </VcBadge>
</template>

<script setup lang="ts">
import { inject, computed } from "vue";
import { configInjectionKey } from "@/core/injection-keys";
import type { IQuoteStatus } from "@/core/types";

interface IProps {
  status?: string;
}

const props = defineProps<IProps>();

const defaultColor = "neutral";
const config = inject(configInjectionKey);
const statuses = config?.quote_statuses || [];

const quoteStatus = computed(() => statuses.find((s: IQuoteStatus) => props.status === s.code));
</script>
