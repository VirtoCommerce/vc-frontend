<template>
  <VcButton
    v-if="action"
    size="sm"
    variant="surface"
    color="secondary"
    icon-size="1rem"
    class="sales-rep-task-action"
    :disabled="disabled"
    :aria-label="t('sales_rep.tasks.table.action_aria', { action: label, name: task.name })"
    @click="$emit('toggle')"
  >
    <!-- Slotted rather than prepend-icon: the glyph carries its own colour while the label keeps the button's.
         Dropped while disabled, so the glyph greys with the rest of the button instead of staying lit. -->
    <template #prepend>
      <VcIcon class="sales-rep-task-action__icon" :name="action.icon" :color="disabled ? undefined : action.color" />
    </template>

    {{ label }}
  </VcButton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { SalesRepTaskStatusType, SalesRepTaskType } from "../types/tasks";

interface IProps {
  task: SalesRepTaskType;
  disabled?: boolean;
}

type TaskActionType = { labelKey: string; icon: string; color: VcMainColorType };

defineEmits<{
  (event: "toggle"): void;
}>();

const props = withDefaults(defineProps<IProps>(), { disabled: false });

const { t } = useI18n();

const COMPLETE: TaskActionType = {
  labelKey: "sales_rep.tasks.table.mark_complete",
  icon: "circle-check-big",
  color: "success",
};
const REOPEN: TaskActionType = { labelKey: "sales_rep.tasks.table.reopen", icon: "rotate-ccw", color: "info" };

/**
 * One action per task: a completed task can only be reopened, an open one only completed. A canceled task gets
 * none — it was closed in the admin app without being done, and neither action describes undoing that.
 */
const ACTIONS: Partial<Record<SalesRepTaskStatusType, TaskActionType>> = {
  upcoming: COMPLETE,
  overdue: COMPLETE,
  completed: REOPEN,
};

const action = computed(() => ACTIONS[props.task.status]);

// The same on every row, so the accessible name adds the task — and leads with this, so a voice-control user can
// say what they see (WCAG 2.5.3).
const label = computed(() => (action.value ? t(action.value.labelKey) : ""));
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-task-action {
  // The glyph lines up with whatever sits above it — the column heading, or the card text on mobile — instead of a
  // button's padding and border in from it. --px is the size's own padding; 2px is VcButton's fixed border-2.
  margin-inline-start: calc((var(--px) + 2px) * -1);

  // VcButton only spaces its own prepend-icon; a slotted one brings its own gap.
  &__icon {
    @apply me-2;
  }
}
</style>
