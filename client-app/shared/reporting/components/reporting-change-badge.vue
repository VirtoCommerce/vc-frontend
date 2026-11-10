<template>
  <VcBadge v-if="change !== null" :color="TONES[direction]" variant="soft" size="sm" rounded nowrap>
    <slot :text="text">{{ text }}</slot>
  </VcBadge>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useReportingFormatters } from "../composables/useReportingFormatters";
import { changeDirection } from "../reporting";
import type { ReportingChangeDirectionType } from "../reporting";

interface IProps {
  /** Percent change; nothing is shown without one (no baseline). */
  change: number | null;
}

interface ISlots {
  /** The badge text; `text` is the formatted change ("↑ 5.5%"). */
  default?: (scope: { text: string }) => unknown;
}

const props = defineProps<IProps>();

defineSlots<ISlots>();

const TONES: Record<ReportingChangeDirectionType, VcMainColorType> = { up: "success", down: "danger", flat: "neutral" };

const formatters = useReportingFormatters();

const direction = computed(() => changeDirection(props.change ?? 0));
const text = computed(() => formatters.change(props.change ?? 0));
</script>
