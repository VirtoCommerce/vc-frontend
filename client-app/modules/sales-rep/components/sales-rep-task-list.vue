<template>
  <VcTable
    class="sales-rep-task-list"
    :loading="loading"
    :items="tasks"
    :pages="pages"
    :page="page"
    mobile-breakpoint="lg"
    @page-changed="$emit('update:page', $event)"
  >
    <template #mobile-item="{ item }">
      <div class="sales-rep-task-list__mobile-item">
        <!-- Same label the desktop control carries: without it the only accessible name is the task title,
             which names the row but not what activating it does (QA A-17). -->
        <button
          type="button"
          :class="titleClass(item)"
          :title="item.name"
          :aria-label="t('sales_rep.tasks.table.edit_aria', { name: item.name })"
          @click="$emit('edit', item)"
        >
          <span class="sales-rep-task-list__name">{{ item.name }}</span>
        </button>

        <span v-if="sublines.get(item.id)" class="sales-rep-task-list__meta">{{ sublines.get(item.id) }}</span>

        <SalesRepTaskStatus :status="item.status" />

        <p v-if="item.description" :title="item.description" class="sales-rep-task-list__notes">
          {{ item.description }}
        </p>

        <SalesRepTaskAction :task="item" :disabled="busy" @toggle="$emit('toggle', item)" />
      </div>
    </template>

    <VcTableColumn id="task" :title="t('sales_rep.tasks.table.task')">
      <template #default="{ item }">
        <!-- The clamp hides the rest of a long title, so the full text has to stay reachable somehow; the
             dashboard widget does the same on its own titles. -->
        <button
          type="button"
          :class="titleClass(item)"
          :title="item.name"
          :aria-label="t('sales_rep.tasks.table.edit_aria', { name: item.name })"
          @click="$emit('edit', item)"
        >
          <span class="sales-rep-task-list__name">{{ item.name }}</span>
        </button>

        <span v-if="sublines.get(item.id)" class="sales-rep-task-list__meta">{{ sublines.get(item.id) }}</span>
      </template>
    </VcTableColumn>

    <VcTableColumn id="status" :title="t('sales_rep.tasks.table.status')" class="sales-rep-task-list__status-col">
      <template #default="{ item }">
        <SalesRepTaskStatus :status="item.status" />
      </template>
    </VcTableColumn>

    <VcTableColumn id="notes" :title="t('sales_rep.tasks.table.notes')">
      <template #default="{ item }">
        <span :title="item.description" class="sales-rep-task-list__notes">{{ item.description }}</span>
      </template>
    </VcTableColumn>

    <VcTableColumn id="actions" :title="t('sales_rep.tasks.table.actions')" class="sales-rep-task-list__actions-col">
      <template #default="{ item }">
        <SalesRepTaskAction :task="item" :disabled="busy" @toggle="$emit('toggle', item)" />
      </template>
    </VcTableColumn>
  </VcTable>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { taskSubline } from "../tasks";
import SalesRepTaskAction from "./sales-rep-task-action.vue";
import SalesRepTaskStatus from "./sales-rep-task-status.vue";
import type { SalesRepTaskType } from "../types/tasks";

interface IProps {
  tasks: SalesRepTaskType[];
  loading?: boolean;
  /** A write is in flight; the row actions hold still until it settles. */
  busy?: boolean;
  page?: number;
  pages?: number;
}

defineEmits<{
  (event: "toggle", task: SalesRepTaskType): void;
  (event: "edit", task: SalesRepTaskType): void;
  (event: "update:page", page: number): void;
}>();

const props = withDefaults(defineProps<IProps>(), { loading: false, busy: false, page: 1, pages: 1 });

const { t, d } = useI18n();

// Resolved once per row rather than per template read: each one formats a date through Intl.
const sublines = computed(() => new Map(props.tasks.map((task) => [task.id, taskSubline(task, t, d)])));

function titleClass(task: SalesRepTaskType): string[] {
  return [
    "sales-rep-task-list__title-button",
    task.status === "completed" ? "sales-rep-task-list__title-button--completed" : "",
  ];
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-task-list {
  @apply pb-3;

  // Fixed layout, so a long note can no longer size its own column and squeeze the task title beside it.
  // Only the two content-shaped columns are measured — a chip and an action — and the remainder is split
  // equally between Task and Notes, which is what fixed layout does with columns that declare no width.
  .vc-table__desktop {
    @apply table-fixed;
  }

  &__status-col {
    @apply w-36;
  }

  &__actions-col {
    @apply w-56;
  }

  &__title-button {
    // A title that opens the editor: a real button, so it is reachable and announced as an action.
    //
    // Clamped rather than truncated: VcTable's desktop table is `w-full` with table-layout AUTO, so a long
    // title grows its own column and `max-w-full` then resolves against a cell that has already stretched —
    // truncate never engaged and the table overflowed the page instead (QA M-1). Wrapping text has a
    // min-content width of its longest word, which the column can shrink to; the clamp caps the height.
    @apply line-clamp-2 max-w-full text-start text-sm font-bold text-[--link-color] hover:text-[--link-hover-color];

    &--completed {
      @apply font-normal text-neutral-600 line-through;
    }
  }

  &__name {
    @apply [word-break:break-word];
  }

  &__meta {
    // -600, not -500: on a hovered row the lighter step falls to 3.76:1, and it only cleared 4.5:1 at rest
    // by 1% anyway (QA A-12).
    @apply mt-0.5 block text-xs text-neutral-600;
  }

  &__notes {
    // Clamped like the title: notes are free text up to 1000 characters, and one long note otherwise sets
    // the height of its whole row. The full text stays in the title attribute.
    @apply line-clamp-2 text-sm text-neutral-600 [word-break:break-word];
  }

  &__mobile-item {
    @apply flex flex-col items-start gap-1.5 border-b px-5 py-4.5;
  }
}
</style>
