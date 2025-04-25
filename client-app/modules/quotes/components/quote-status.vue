<template>
  <VcTooltip class="quote-status">
    <template #trigger>
      <VcChip
        :variant="quoteStatus?.variant"
        :icon="icon ?? quoteStatus?.icon"
        :color="quoteStatus?.color || defaultColor"
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
import type { IQuoteStatus } from "@/core/types";

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
const statuses = themeContext.value?.settings?.quote_statuses || [];

const quoteStatus = computed(() => statuses.find((s: IQuoteStatus) => props.status === s.code));
</script>

<style lang="scss">
.quote-status {
  @apply min-w-0 max-w-full;
}
</style>
