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

// The Orders recipe (settings_data.json → orders_statuses), one order state per task state: upcoming = Processing,
// overdue = Cancelled (the danger pair), completed = Completed; canceled has no order twin and takes neutral.
// "tonal" is the current name of the deprecated "outline-dark" those settings still use.
const APPEARANCE: Record<SalesRepTaskStatusType, StatusAppearanceType> = {
  overdue: { color: "danger", variant: "tonal", icon: "circle-solid" },
  upcoming: { color: "info", variant: "outline", icon: "process" },
  completed: { color: "success", variant: "tonal", icon: "circle-solid" },
  canceled: { color: "neutral", variant: "tonal", icon: "circle-solid" },
};

const appearance = computed(() => APPEARANCE[props.status]);
</script>
