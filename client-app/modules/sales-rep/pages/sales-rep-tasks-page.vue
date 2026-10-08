<template>
  <div class="sales-rep-tasks-page">
    <VcBreadcrumbs :items="breadcrumbs" />

    <div class="sales-rep-tasks-page__head">
      <div class="sales-rep-tasks-page__heading">
        <VcTypography class="sales-rep-tasks-page__title" tag="h1">
          {{ t("sales_rep.tasks.title") }}
        </VcTypography>

        <p class="sales-rep-tasks-page__subtitle">{{ t("sales_rep.tasks.page.subtitle") }}</p>
      </div>

      <div class="sales-rep-tasks-page__actions">
        <VcButton prepend-icon="plus" @click="openTaskModal()">
          {{ t("sales_rep.tasks.new_task") }}
        </VcButton>
      </div>
    </div>

    <SalesRepRuleAlert :filter-failed="filterRulesFailed" />

    <!-- Today, a picked day and All are the views with no status rule. A picked day gets a chip of its own,
         labelled with its date, so the row always says which day the list shows (VCST-5732 QA A-2, A-5). -->
    <SalesRepRuleChips v-model="filter" :rules="tabRules" :loading="filterRulesLoading">
      <template #baseline>
        <SalesRepTaskScopeChips
          :view="scopeView"
          :day-label="dateChipLabel"
          :show-day="Boolean(dateChip)"
          :counts="counts"
          @today="goToToday"
          @day="showDateChip"
          @all="showAll"
          @clear-day="clearDay"
        />
      </template>
    </SalesRepRuleChips>

    <div class="sales-rep-tasks-page__body">
      <div class="sales-rep-tasks-page__main">
        <VcWidget size="md">
          <template #header-container>
            <div class="sales-rep-tasks-page__day-head">
              <!-- The heading is the only thing that names the current scope, and picking a day or a tab
                   replaces the list under it without a word (QA A-9). Announcing the heading covers both,
                   and atomically so the date and the count are read as one.

                   role="status" as well as the attributes: a bare div carrying only aria-live is exposed as a
                   generic node, which is why QA could not find the live region in the accessibility tree. The role
                   implies polite+atomic, but the explicit pair is what older AT reads. -->
              <div role="status" aria-live="polite" aria-atomic="true">
                <!-- The h2 variant uppercases by default, which turned the date into SEP 18, 2026 — the only
                     shouted text on the page (QA A-22). The prop is the component's own opt-out. -->
                <VcTypography tag="h2" text-transform="none" class="sales-rep-tasks-page__day-title">
                  {{ panelTitle }}
                </VcTypography>

                <span class="sales-rep-tasks-page__day-count">
                  {{ t("sales_rep.tasks.day_task_count", { count: totalCount }, totalCount) }}
                </span>
              </div>
            </div>
          </template>

          <template #default-container>
            <!-- A failure replaces the rows: apollo keeps the previous ones on a failed refetch. -->
            <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.tasks.load_failed')" variant="error" />

            <!-- Never a keyword miss — this page has no search — so empty means the current scope is empty, and
                 which scope that is depends on whether a status tab replaced the day. -->
            <VcEmptyView
              v-else-if="!tasks.length && !loading"
              :text="t(inDayView ? 'sales_rep.tasks.empty_day' : 'sales_rep.tasks.empty')"
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
      </div>

      <aside class="sales-rep-tasks-page__aside" :aria-labelledby="dueDatesTitleId">
        <VcWidget size="sm">
          <!-- Centres the inline-flex calendar (QA M-10); the title and legend share its left edge. -->
          <div class="sales-rep-tasks-page__month">
            <!-- In the content, not the widget's title: a header row would add a divider the mockup does not have. -->
            <VcTypography :id="dueDatesTitleId" tag="h2" variant="h5" class="sales-rep-tasks-page__month-title">
              {{ t("sales_rep.tasks.due_dates") }}
            </VcTypography>

            <!-- No selection outside the day view: the list is not day-scoped then, so highlighting a day would
                 misdescribe it - and reka emits nothing when the clicked day is already the selected one, which
                 made that cell a dead click. With no selection, any day is a change and clears the tab. -->
            <SalesRepTaskCalendar
              size="sm"
              :model-value="inDayView ? selectedDay : undefined"
              :month="month"
              :day-markers="dayMarkers"
              @update:model-value="selectDay"
              @update:month="setMonth"
            />

            <ul class="sales-rep-tasks-page__legend">
              <li v-for="kind in TASK_MARKER_KINDS" :key="kind" class="sales-rep-tasks-page__legend-item">
                <span :class="`sales-rep-tasks-page__legend-dot sales-rep-tasks-page__legend-dot--${kind}`" />
                {{ t(`sales_rep.tasks.legend.${kind}`) }}
              </li>
            </ul>
          </div>
        </VcWidget>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables/useBreadcrumbs";
import { useRouteQueryParam } from "@/core/composables/useRouteQueryParam";
import { useModal } from "@/shared/modal";
import SalesRepRuleAlert from "../components/sales-rep-rule-alert.vue";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import SalesRepTaskCalendar from "../components/sales-rep-task-calendar.vue";
import SalesRepTaskList from "../components/sales-rep-task-list.vue";
import SalesRepTaskModal from "../components/sales-rep-task-modal.vue";
import SalesRepTaskScopeChips from "../components/sales-rep-task-scope-chips.vue";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { useMonthAnchor, useSalesRepTaskCalendar } from "../composables/useSalesRepTaskCalendar";
import { useSalesRepTaskCounts } from "../composables/useSalesRepTaskCounts";
import { useSalesRepTaskMutations } from "../composables/useSalesRepTaskMutations";
import { useSalesRepTasks } from "../composables/useSalesRepTasks";
import { TASKS_SORT_RULE } from "../constants";
import { TASK_MARKER_KINDS, localDayKey, localDayKeyToDate, localDayWindow, toMonthKey } from "../tasks";
import type { SalesRepTaskScopeType, SalesRepTaskType } from "../types/tasks";

const { t, d } = useI18n();
const { openModal } = useModal();

// Home is prepended by the composable. Same trail the customer pages carry, without their customer legs.
const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("sales_rep.hub.title") },
  { title: t("sales_rep.tasks.title") },
]);

// Names the month rail's landmark after its own heading.
const dueDatesTitleId = useId();

// Resolved once, like the counts' own boundary: a "today" that moved mid-session would reshuffle the chips. So, on
// purpose, a page left open past midnight keeps listing the day it opened on under Today until it is reloaded.
const todayKey = localDayKey(new Date());
const selectedDay = ref(todayKey);
// The date chip's day: opened by picking a day other than today, closed only by its ×.
const dateChip = ref<string>();
// All is a view of its own rather than a server rule: every task, with neither a day window nor a filter.
const showingAll = ref(false);
// Drives the dots query. The calendar owns which month is on screen and reports it back.
const { month, setMonth } = useMonthAnchor();

/**
 * The day and the status tab are two views of the same set, not two filters over it: a status tab spans every
 * date (overdue work is never due today, so intersecting it with a day would show nothing), and picking a date
 * goes back to that day's full list. Anding them is what made an active "Completed 3" sit over an empty list —
 * the badges count the whole set, so a tab must show the whole set too.
 *
 * Held in the URL, so the dashboard's overdue notice can deep-link to `?filter=overdue` and a status tab survives
 * a refresh (All and a picked day do not: they reopen on Today). `replace`, not `push`: stepping through the chips must not turn Back into an undo button. The
 * baseline writes an empty string, which useRouteQueryParam drops from the query, so the day view stays on a
 * clean URL — and the day itself is not in there, because it defaults to today and a bookmarked date goes stale.
 */
const filterParam = useRouteQueryParam<string>("filter", { updateMethod: "replace" });
const filter = computed<string | undefined>({
  get: () => filterParam.value || undefined,
  set: (value) => {
    filterParam.value = value ?? "";
  },
});

const inDayView = computed(() => !filter.value && !showingAll.value);
const isToday = computed(() => selectedDay.value === todayKey);
// Which of Today / the picked day / All is on; undefined while a status tab has taken over.
const scopeView = computed<SalesRepTaskScopeType | undefined>(() => {
  if (filter.value) {
    return undefined;
  }

  if (showingAll.value) {
    return "all";
  }

  return isToday.value ? "today" : "day";
});

const period = computed(() => (inDayView.value ? localDayWindow(selectedDay.value) : undefined));

const {
  items: tasks,
  loading,
  error,
  page,
  pages,
  totalCount,
  refetch,
} = useSalesRepTasks({
  period,
  filter,
  sort: TASKS_SORT_RULE,
});

// Every chip's badge in one request.
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
const dateChipLabel = computed(() => (dateChip.value ? d(localDayKeyToDate(dateChip.value), "short") : ""));

// Whichever view is on: the tab named by its own chip, All, or the day.
const panelTitle = computed(() => {
  if (filter.value) {
    return filterRules.value.find((rule) => rule.name === filter.value)?.label ?? filter.value;
  }

  return showingAll.value ? t("sales_rep.tasks.all") : selectedDayLabel.value;
});

function selectDay(day: string): void {
  selectedDay.value = day;
  showingAll.value = false;
  filter.value = undefined;

  if (day !== todayKey) {
    dateChip.value = day;
  }
}

// The Today chip: the list, the tab and the grid's month all come back to today.
function goToToday(): void {
  selectDay(todayKey);
  setMonth(todayKey);
}

function showAll(): void {
  showingAll.value = true;
  filter.value = undefined;
}

// The date chip: back to its day, with the grid on that day's month.
function showDateChip(): void {
  if (dateChip.value) {
    selectDay(dateChip.value);
    setMonth(dateChip.value);
  }
}

// The date chip's ×. A view of its day falls back to today; a tab or All stays on screen, and so does the month
// the rep paged the grid to under it.
function clearDay(): void {
  const wasOnScreen = scopeView.value === "day";

  // Also the new-task modal's default day, so it must not outlive the chip, on screen or not.
  if (selectedDay.value === dateChip.value) {
    selectedDay.value = todayKey;
  }

  dateChip.value = undefined;

  if (wasOnScreen) {
    setMonth(todayKey);
  }
}

function changePage(value: number): void {
  page.value = value;
}

/**
 * Every surface reads the same records, so a write refreshes all three rather than patching the cache.
 * allSettled, not all: a refetch that fails is already logged by its composable's onError and drawn by the
 * surface's failure view, so a rejection escaping here would only be console noise from an event handler.
 */
async function refreshAll(): Promise<void> {
  await Promise.allSettled([refetch(), refetchCounts(), refetchMarkers()]);
}

async function toggleCompletion(task: SalesRepTaskType): Promise<void> {
  await setCompleted(task.id, task.status !== "completed");

  // Either way: a failed toggle usually means the row is stale (deleted from another tab), and leaving it on
  // screen invites the same click again.
  await refreshAll();
}

// A save reports the day it landed on: a task moved to another date would otherwise be refetched into a view
// that no longer contains it, leaving "Task saved" over a list where it is nowhere to be seen. A delete reports
// nothing — there is no row left to go to.
async function onTaskSaved(dayKey?: string): Promise<void> {
  // Follow the task only in the DAY view, and only when it actually moved. A status tab and All span every date,
  // so a task that changed date is in or out of them on its own merits — jumping to its day would throw away
  // the view the rep chose, and a tab's `?filter=` in the URL with it.
  const movedTo = dayKey && inDayView.value && dayKey !== selectedDay.value ? dayKey : undefined;
  const rescopesGrid = !!movedTo && toMonthKey(movedTo) !== month.value;

  if (movedTo) {
    selectDay(movedTo);
    setMonth(movedTo);
  }

  /**
   * Only the surfaces the move did NOT rescope get an explicit refetch. Apollo restarts a query whose variables
   * changed on its own, and its `restart` is deferred to `nextTick` while `refetch()` runs synchronously — so
   * refetching a rescoped query here fires a second, redundant request carrying the pre-move variables.
   * The counts key off no day, so no move rescopes them: they are always refetched.
   */
  await Promise.allSettled([
    refetchCounts(),
    ...(movedTo ? [] : [refetch()]),
    ...(rescopesGrid ? [] : [refetchMarkers()]),
  ]);
}

function openTaskModal(task?: SalesRepTaskType): void {
  openModal({
    component: SalesRepTaskModal,
    props: { task, defaultDay: selectedDay.value, onSaved: onTaskSaved },
  });
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-tasks-page {
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

  // The month rail splits off at xl, like layout-surface's aside, level with the list column.
  &__body {
    @apply flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  &__main {
    @apply min-w-0 grow;
  }

  &__day-head {
    @apply px-6 py-4;
  }

  &__day-count {
    // Enough of a gap to read as a second line rather than as part of the heading above it (QA M-6).
    @apply mt-2 block text-xs text-neutral-500;
  }

  // Room for a `sm` calendar plus a long month name ("September 2026"); __month centres the rest.
  &__aside {
    @apply min-w-0 xl:w-[17.5rem] xl:shrink-0;
  }

  &__month {
    @apply mx-auto w-fit;
  }

  &__month-title {
    @apply mb-1;
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

    // -600, matching the calendar dots: -500 shares a luminance with the blue, and -400 scored 2.69:1 on
    // white — under the 3:1 a meaningful graphic needs (QA A-11). Darker separates it on lightness too.
    &--completed {
      background-color: var(--color-success-600);
    }
  }
}
</style>
