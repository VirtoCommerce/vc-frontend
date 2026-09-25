<template>
  <VcChip :color="appearance.color" :variant="appearance.variant" size="sm" rounded truncate>
    <VcIcon variant="solid" :name="appearance.icon" />

    <span>{{ t(`sales_rep.tasks.status.${status}`) }}</span>
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

type StatusAppearanceType = { color: VcChipColorType; variant: VcChipVariantType; icon: string };

// The Orders recipe (settings_data.json → orders_statuses): semantic colour + variant + a leading glyph, and the
// same pairs as the order states they read like — open work as Processing, closed as Completed / Cancelled.
// "tonal" is what those settings still spell as the deprecated "outline-dark"; VcChip renders the two the same.
const APPEARANCE: Record<SalesRepTaskStatusType, StatusAppearanceType> = {
  overdue: { color: "danger", variant: "tonal", icon: "circle-solid" },
  upcoming: { color: "info", variant: "outline", icon: "process" },
  completed: { color: "success", variant: "tonal", icon: "circle-solid" },
  canceled: { color: "neutral", variant: "tonal", icon: "circle-solid" },
};

const appearance = computed(() => APPEARANCE[props.status]);
</script>
