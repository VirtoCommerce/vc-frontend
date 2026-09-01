<template>
  <VcTable
    :loading="loading"
    :items="tasks"
    :pages="pages"
    :page="page"
    :row-class="rowClass"
    mobile-breakpoint="lg"
    @page-changed="$emit('update:page', $event)"
  >
    <template #mobile-item="{ item }">
      <div class="sales-rep-task-list__mobile-item">
        <VcCheckbox
          :model-value="item.status === 'completed'"
          :aria-label="completionLabel(item)"
          :disabled="busy"
          @update:model-value="$emit('toggle', item)"
        />

        <div class="sales-rep-task-list__mobile-body">
          <button type="button" class="sales-rep-task-list__title-button" @click="$emit('edit', item)">
            <span class="sales-rep-task-list__name">{{ item.name }}</span>
          </button>

          <span v-if="subline(item)" class="sales-rep-task-list__meta">{{ subline(item) }}</span>

          <SalesRepTaskStatus :status="item.status" />

          <p v-if="item.description" class="sales-rep-task-list__notes">{{ item.description }}</p>
        </div>
      </div>
    </template>

    <VcTableColumn id="done" class="sales-rep-task-list__done-col">
      <template #default="{ item }">
        <VcCheckbox
          :model-value="item.status === 'completed'"
          :aria-label="completionLabel(item)"
          :disabled="busy"
          @update:model-value="$emit('toggle', item)"
        />
      </template>
    </VcTableColumn>

    <VcTableColumn id="task" :title="t('sales_rep.tasks.table.task')">
      <template #default="{ item }">
        <button
          type="button"
          class="sales-rep-task-list__title-button"
          :aria-label="t('sales_rep.tasks.table.edit_aria', { name: item.name })"
          @click="$emit('edit', item)"
        >
          <span class="sales-rep-task-list__name">{{ item.name }}</span>
        </button>

        <span v-if="subline(item)" class="sales-rep-task-list__meta">{{ subline(item) }}</span>
      </template>
    </VcTableColumn>

    <VcTableColumn id="status" :title="t('sales_rep.tasks.table.status')" class="sales-rep-task-list__status-col">
      <template #default="{ item }">
        <SalesRepTaskStatus :status="item.status" />
      </template>
    </VcTableColumn>

    <VcTableColumn id="notes" :title="t('sales_rep.tasks.table.notes')">
      <template #default="{ item }">
        <span class="sales-rep-task-list__notes">{{ item.description }}</span>
      </template>
    </VcTableColumn>
  </VcTable>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SalesRepTaskStatus from "./sales-rep-task-status.vue";
import type { SalesRepTaskType } from "../types/tasks";

interface IProps {
  tasks: SalesRepTaskType[];
  loading?: boolean;
  /** A write is in flight; the checkboxes hold still until it settles. */
  busy?: boolean;
  page?: number;
  pages?: number;
}

defineEmits<{
  (event: "toggle", task: SalesRepTaskType): void;
  (event: "edit", task: SalesRepTaskType): void;
  (event: "update:page", page: number): void;
}>();

withDefaults(defineProps<IProps>(), { loading: false, busy: false, page: 1, pages: 1 });

const { t, d } = useI18n();

// The line under the title: what is most useful about the deadline, else the task's type ("Finance").
// An overdue task says when it expired; anything else with a date says when it is due.
function subline(task: SalesRepTaskType): string {
  if (!task.dueDate) {
    return task.type;
  }

  if (task.status === "overdue") {
    return t("sales_rep.tasks.due_relative.expired", { date: d(task.dueDate, "short") });
  }

  return task.status === "completed"
    ? task.type
    : t("sales_rep.tasks.due_relative.due", { date: d(task.dueDate, "short") });
}

function completionLabel(task: SalesRepTaskType): string {
  return task.status === "completed"
    ? t("sales_rep.tasks.table.reopen_aria", { name: task.name })
    : t("sales_rep.tasks.table.complete_aria", { name: task.name });
}

// Overdue rows carry a left accent, matching the mockup's red/blue/green bars.
function rowClass(item: SalesRepTaskType, index: number): string {
  return [`sales-rep-task-list__row--${item.status}`, index % 2 === 1 ? "bg-neutral-50" : ""].filter(Boolean).join(" ");
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-task-list {
  &__done-col {
    @apply w-10;
  }

  &__status-col {
    @apply w-36;
  }

  &__title-button {
    // A title that opens the editor: a real button, so it is reachable and announced as an action.
    @apply block max-w-full truncate text-start text-sm font-bold text-[--link-color] hover:text-[--link-hover-color];
  }

  &__name {
    @apply [word-break:break-word];
  }

  &__meta {
    @apply mt-0.5 block text-xs text-neutral-500;
  }

  &__notes {
    @apply text-sm text-neutral-600 [word-break:break-word];
  }

  &__mobile-item {
    @apply flex items-start gap-3 border-b px-5 py-4.5;
  }

  &__mobile-body {
    @apply flex min-w-0 grow flex-col items-start gap-1.5;
  }

  // Logical border so the accent flips in RTL.
  &__row--overdue td:first-child {
    border-inline-start: 3px solid var(--color-danger-500);
  }

  &__row--upcoming td:first-child {
    border-inline-start: 3px solid var(--color-info-500);
  }

  &__row--completed td:first-child {
    border-inline-start: 3px solid var(--color-success-500);
  }
}
</style>
