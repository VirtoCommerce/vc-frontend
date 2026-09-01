import { computed } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepTaskCountsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { startOfLocalDayIso } from "../tasks";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepTaskCountsType } from "../types/tasks";

/**
 * Badges for the All / Upcoming / Overdue / Completed chips, in ONE round trip: the query aliases
 * salesRepTasks four times with first: 0, so each alias returns only a totalCount. There is deliberately no
 * backend counts query — aliasing already gives a single request, and a bespoke field would have to
 * re-derive the same rules.
 */
export function useSalesRepTaskCounts(today: string = startOfLocalDayIso()) {
  const { result, loading, error, onError, refetch } = useSalesRepHubQuery(
    SalesRepTaskCountsDocument,
    computed(() => ({ today })),
    { fetchPolicy: HUB_FETCH_POLICY },
  );

  onError((err) => {
    Logger.error("[sales-rep] salesRepTaskCounts failed:", err);
  });

  const counts = computed<SalesRepTaskCountsType>(() => ({
    all: result.value?.all?.totalCount ?? 0,
    upcoming: result.value?.upcoming?.totalCount ?? 0,
    overdue: result.value?.overdue?.totalCount ?? 0,
    completed: result.value?.completed?.totalCount ?? 0,
  }));

  return { counts, loading, error, refetch };
}
