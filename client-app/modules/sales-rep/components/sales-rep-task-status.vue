<template>
  <VcChip :color="appearance.color" :variant="appearance.variant" size="sm" rounded truncate>
    {{ t(`sales_rep.tasks.status.${status}`) }}
  </VcChip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { SalesRepTaskStatusType } from "../types/tasks";

interface IProps {
  status: SalesRepTaskStatusType;
}

const props = defineProps<IProps>();

const { t } = useI18n();

// Overdue is the only one that needs to pull the eye, so it is the only filled chip.
const APPEARANCE: Record<SalesRepTaskStatusType, { color: VcChipColorType; variant: VcChipVariantType }> = {
  overdue: { color: "danger", variant: "soft" },
  upcoming: { color: "info", variant: "outline" },
  completed: { color: "success", variant: "outline" },
  canceled: { color: "neutral", variant: "outline" },
};

const appearance = computed(() => APPEARANCE[props.status]);
</script>
