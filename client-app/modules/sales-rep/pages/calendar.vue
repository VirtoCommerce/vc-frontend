<template>
  <div class="sales-rep-calendar">
    <div class="sales-rep-calendar__head">
      <div class="sales-rep-calendar__heading">
        <VcTypography class="sales-rep-calendar__title" tag="h1">
          {{ t("sales_rep.tasks.title") }}
        </VcTypography>

        <p class="sales-rep-calendar__subtitle">{{ t("sales_rep.tasks.page.subtitle") }}</p>
      </div>

      <div class="sales-rep-calendar__actions">
        <VcButton color="secondary" variant="outline" prepend-icon="calendar" @click="goToToday">
          {{ t("sales_rep.tasks.today") }}
        </VcButton>

        <VcButton prepend-icon="plus" @click="openTaskModal()">
          {{ t("sales_rep.tasks.new_task") }}
        </VcButton>
      </div>
    </div>

    <SalesRepRuleAlert :filter-failed="filterRulesFailed" />

    <SalesRepRuleChips
      v-model="filter"
      :rules="tabRules"
      :all-label="t('sales_rep.tasks.page.all_tab')"
      :all-count="counts.all"
      :loading="filterRulesLoading"
    />

    <div class="sales-rep-calendar__body">
      <VcWidget size="md" class="sales-rep-calendar__day">
        <template #header-container>
          <div class="sales-rep-calendar__day-head">
            <div>
              <VcTypography tag="h2" class="sales-rep-calendar__day-title">{{ selectedDayLabel }}</VcTypography>

              <span class="sales-rep-calendar__day-count">
                {{ t("sales_rep.tasks.day_of_total", { shown: tasks.length, total: totalCount }) }}
              </span>
            </div>

            <VcButton size="sm" color="secondary" variant="outline" prepend-icon="plus" @click="openTaskModal()">
              {{ t("sales_rep.tasks.add_task") }}
            </VcButton>
          </div>
        </template>

        <template #default-container>
          <!-- A failure replaces the rows: apollo keeps the previous ones on a failed refetch. -->
          <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.tasks.load_failed')" variant="error" />

          <!-- Empty here always means "nothing due on this day": the list is narrowed by the day and the tab,
               never by a keyword — this page has no search. -->
          <VcEmptyView
            v-else-if="!tasks.length && !loading"
            :text="t('sales_rep.tasks.empty_day')"
            variant="empty"
            icon="calendar"
          />

          <SalesRepTaskList
            v-else
            :tasks="tasks"
            :loading="loading"
            :busy="saving"
            :page="page"
            :pages="pages"
            @toggle="toggleCompletion"
            @edit="openTaskModal"
            @update:page="changePage"
          />
        </template>
      </VcWidget>

      <aside class="sales-rep-calendar__aside">
        <!-- VcCalendar renders its own month/year header, so this widget adds none. -->
        <VcWidget size="md">
          <SalesRepTaskCalendar
            v-model="selectedDay"
            :month="month"
            :day-markers="dayMarkers"
            @update:month="setMonth"
          />

          <ul class="sales-rep-calendar__legend">
            <li v-for="kind in TASK_MARKER_KINDS" :key="kind" class="sales-rep-calendar__legend-item">
              <span :class="`sales-rep-calendar__legend-dot sales-rep-calendar__legend-dot--${kind}`" />
              {{ t(`sales_rep.tasks.legend.${kind}`) }}
            </li>
          </ul>
        </VcWidget>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useModal } from "@/shared/modal";
import SalesRepRuleAlert from "../components/sales-rep-rule-alert.vue";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import SalesRepTaskCalendar from "../components/sales-rep-task-calendar.vue";
import SalesRepTaskList from "../components/sales-rep-task-list.vue";
import SalesRepTaskModal from "../components/sales-rep-task-modal.vue";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { useMonthAnchor, useSalesRepTaskCalendar } from "../composables/useSalesRepTaskCalendar";
import { useSalesRepTaskCounts } from "../composables/useSalesRepTaskCounts";
import { useSalesRepTaskMutations } from "../composables/useSalesRepTaskMutations";
import { useSalesRepTasks } from "../composables/useSalesRepTasks";
import { TASK_MARKER_KINDS, localDayKey, localDayKeyToDate, localDayWindow } from "../tasks";
import type { SalesRepTaskType } from "../types/tasks";

const { t, d } = useI18n();
const { openModal } = useModal();

const selectedDay = ref(localDayKey(new Date()));
// Drives the dots query. The calendar owns which month is on screen and reports it back.
const { month, setMonth, goToToday: monthToday } = useMonthAnchor();

// The day list is a due-date window intersected with the selected tab, which is how the backend composes
// `period` and `filter` — one is not a substitute for the other.
const period = computed(() => localDayWindow(selectedDay.value));

const {
  items: tasks,
  loading,
  error,
  filter,
  page,
  pages,
  totalCount,
  refetch,
} = useSalesRepTasks({
  period,
  sort: "due-date",
});

const { counts, refetch: refetchCounts } = useSalesRepTaskCounts();
const { dayMarkers, refetch: refetchMarkers } = useSalesRepTaskCalendar(month);
const { setCompleted, loading: saving } = useSalesRepTaskMutations();

const {
  rules: filterRules,
  failed: filterRulesFailed,
  loading: filterRulesLoading,
} = useSalesRepRules("task", "filter");

const failed = computed(() => Boolean(error.value));

// Badge each server-offered tab with its own total. The counts query and the chips agree by rule name.
const tabRules = computed(() =>
  filterRules.value.map((rule) => ({
    ...rule,
    count: counts.value[rule.name as keyof typeof counts.value],
  })),
);

// "short" (Sep 1, 2026), not "long" — the long named format appends a time, and this heading names a DAY.
const selectedDayLabel = computed(() => d(localDayKeyToDate(selectedDay.value), "short"));

function goToToday(): void {
  selectedDay.value = localDayKey(new Date());
  monthToday();
}

function changePage(value: number): void {
  page.value = value;
}

// Every surface reads the same records, so a write refreshes all three rather than patching the cache.
async function refreshAll(): Promise<void> {
  await Promise.all([refetch(), refetchCounts(), refetchMarkers()]);
}

async function toggleCompletion(task: SalesRepTaskType): Promise<void> {
  if (await setCompleted(task.id, task.status !== "completed")) {
    await refreshAll();
  }
}

function openTaskModal(task?: SalesRepTaskType): void {
  openModal({
    component: SalesRepTaskModal,
    props: { task, defaultDay: selectedDay.value, onSaved: refreshAll },
  });
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-calendar {
  &__head {
    @apply flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between;
  }

  &__title {
    @apply [word-break:break-word];
  }

  &__subtitle {
    @apply mt-1 text-sm text-neutral-500 [word-break:break-word];
  }

  &__actions {
    @apply flex flex-none flex-wrap gap-3;
  }

  // The month rail only splits off at xl, matching layout-surface's aside breakpoint.
  &__body {
    @apply mt-5 flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  &__day {
    @apply min-w-0 grow;
  }

  &__day-head {
    @apply flex items-center justify-between gap-4 px-6 py-4;
  }

  &__day-count {
    @apply mt-0.5 block text-xs text-neutral-500;
  }

  &__aside {
    @apply min-w-0 xl:w-96 xl:shrink-0;
  }

  &__legend {
    @apply m-0 mt-4 flex list-none flex-wrap gap-4 p-0 text-xs text-neutral-500;
  }

  &__legend-item {
    @apply flex items-center gap-1.5;
  }

  &__legend-dot {
    @apply size-1.5 rounded-full;

    &--upcoming {
      background-color: var(--color-info-500);
    }

    &--overdue {
      background-color: var(--color-danger-500);
    }

    // -400, matching the calendar dots: at -500 the green and the blue share a luminance and blur together.
    &--completed {
      background-color: var(--color-success-400);
    }
  }
}
</style>
