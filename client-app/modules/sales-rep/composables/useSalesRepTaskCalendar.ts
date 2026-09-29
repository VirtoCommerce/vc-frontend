import { computed, ref } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepTasksDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY, TASKS_CALENDAR_MAX } from "../constants";
import {
  buildDayMarkers,
  localCalendarWindow,
  startOfLocalDay,
  startOfLocalDayIso,
  taskStatus,
  toMonthKey,
} from "../tasks";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepTaskDayMarkersType } from "../types/tasks";
import type { Ref } from "vue";

/**
 * The dots on the month grid. Fetches the visible month's tasks with a light selection and buckets them by day
 * CLIENT-SIDE, because a day is a day on the viewer's calendar — bucketing server-side would mean shipping 28-31
 * boundaries or inventing a timezone contract. A month is tens of tasks, so one bounded page covers it.
 */
export function useSalesRepTaskCalendar(monthAnchor: Ref<string>) {
  const dayStart = startOfLocalDay();
  const today = startOfLocalDayIso();

  const period = computed(() => localCalendarWindow(monthAnchor.value));

  const variables = computed(() => ({
    first: TASKS_CALENDAR_MAX,
    after: "0",
    today,
    period: period.value,
    sort: "due-date",
  }));

  const { result, loading, error, onError, refetch } = useSalesRepHubQuery(SalesRepTasksDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    Logger.error("[sales-rep] salesRepTasks (calendar) failed:", err);
  });

  const dayMarkers = computed<SalesRepTaskDayMarkersType>(() =>
    buildDayMarkers(
      (result.value?.salesRepTasks?.items ?? [])
        .filter((task): task is NonNullable<typeof task> => task != null)
        .map((task) => ({ dueDate: task.dueDate as string | undefined, status: taskStatus(task, dayStart) })),
    ),
  );

  return { dayMarkers, loading, error, refetch };
}

/**
 * The month a grid is showing, as a "YYYY-MM-01" key — the shape VcCalendar's `month` prop and `update:month`
 * emit both speak, so no Date conversion is needed at the call sites.
 */
export function useMonthAnchor(initial: Date = new Date()) {
  const month = ref(toMonthKey(initial));

  function setMonth(value: string): void {
    month.value = toMonthKey(value);
  }

  function goToToday(): void {
    month.value = toMonthKey(new Date());
  }

  return { month, setMonth, goToToday };
}
