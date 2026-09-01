import { computed, ref, toValue, watch } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepTasksDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY, TASKS_PAGE_SIZE } from "../constants";
import { startOfLocalDay, startOfLocalDayIso, taskStatus } from "../tasks";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepTaskFieldsFragment } from "../api/graphql/types";
import type { SalesRepTaskType } from "../types/tasks";
import type { Ref } from "vue";

/** Wire row -> view model, with the status derived on the caller's day boundary (see tasks.ts). */
function mapSalesRepTask(task: SalesRepTaskFieldsFragment, dayStart: Date): SalesRepTaskType {
  return {
    id: task.id,
    name: task.name,
    description: task.description ?? "",
    type: task.type ?? "",
    priority: task.priority ?? "",
    dueDate: (task.dueDate as string | undefined) ?? undefined,
    isActive: task.isActive,
    completed: task.completed ?? undefined,
    createdDate: task.createdDate as string,
    modifiedDate: (task.modifiedDate as string | undefined) ?? undefined,
    status: taskStatus(task, dayStart),
  };
}

type UseSalesRepTasksOptionsType = {
  // Expanded union (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
  pageSize?: number | Ref<number | undefined> | (() => number | undefined);
  /** Fixed due-date window, e.g. the day a calendar cell selected. Overrides nothing — it intersects with the tab. */
  period?: Ref<{ from: string; to: string } | undefined>;
  sort?: string;
};

/**
 * The rep's own tasks. Fetches whenever it runs; "hidden ⇒ zero requests" is owned by the layout mounting only
 * visible blocks.
 */
export function useSalesRepTasks(options: UseSalesRepTasksOptionsType = {}) {
  // undefined = the synthetic "All" baseline, matching sales-rep-rule-chips' convention.
  const filter = ref<string | undefined>(undefined);
  const sortRule = ref<string | undefined>(options.sort);
  const page = ref(1);

  const pageSize = computed(() => toValue(options.pageSize) ?? TASKS_PAGE_SIZE);

  // Resolved once per composable, not per render: a boundary that moved mid-session would reshuffle the tabs
  // under the user, and it also has to stay stable for the backend's criteria cache to engage.
  const dayStart = startOfLocalDay();
  const today = startOfLocalDayIso();

  const variables = computed(() => ({
    first: pageSize.value,
    // xAPI connections take the offset as the cursor.
    after: String((page.value - 1) * pageSize.value),
    sort: sortRule.value,
    filter: filter.value,
    today,
    period: options.period?.value,
  }));

  const { result, loading, error, onError, refetch } = useSalesRepHubQuery(SalesRepTasksDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the surfaces show their own error view instead.
    Logger.error("[sales-rep] salesRepTasks failed:", err);
  });

  const items = computed<SalesRepTaskType[]>(() =>
    (result.value?.salesRepTasks?.items ?? [])
      .filter((task): task is NonNullable<typeof task> => task != null)
      .map((task) => mapSalesRepTask(task, dayStart)),
  );

  const totalCount = computed(() => result.value?.salesRepTasks?.totalCount ?? 0);

  const pages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)));

  watch(pages, (total) => {
    if (page.value > total) {
      page.value = total;
    }
  });

  // flush: "sync" resets the page before the variables watcher runs, so a filter/sort change fires one request.
  watch(
    [filter, sortRule],
    () => {
      page.value = 1;
    },
    { flush: "sync" },
  );

  return {
    refetch,
    loading,
    error,
    filter,
    sortRule,
    page,
    pages,
    items,
    totalCount,
  };
}
