<template>
  <VcChip :variant="quoteStatus?.variant" :color="quoteStatus?.color || defaultColor" truncate rounded>
    {{ status }}
  </VcChip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";

interface IQuoteStatus {
  code: string;
  color: VcChipColorType;
  variant: VcChipVariantType;
}

interface IProps {
  status?: string;
}

const props = defineProps<IProps>();

const { themeContext } = useThemeContext();

const defaultColor = "neutral";
const statuses = themeContext.value?.settings?.quote_statuses || [];

const quoteStatus = computed(() => statuses.find((s: IQuoteStatus) => props.status === s.code));
</script>
