import { computed } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepOverdueTaskCountDocument, SalesRepTaskCountsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { localDayKey, localDayWindow, startOfLocalDayIso } from "../tasks";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepTaskCountsType } from "../types/tasks";

/**
 * Badges for the Today / All / Upcoming / Overdue / Completed chips, in ONE round trip: the query aliases
 * salesRepTasks with first: 0, so each alias returns only a totalCount. There is deliberately no backend counts
 * query — aliasing already gives a single request, and a bespoke field would have to re-derive the rules.
 */
export function useSalesRepTaskCounts() {
  const today = startOfLocalDayIso();
  // Resolved once, like `today`: a boundary that moved mid-session would reshuffle the badges under the rep.
  const todayPeriod = localDayWindow(localDayKey(new Date()));

  const { result, loading, error, onError, refetch } = useSalesRepHubQuery(
    SalesRepTaskCountsDocument,
    computed(() => ({ today, todayPeriod })),
    { fetchPolicy: HUB_FETCH_POLICY },
  );

  onError((err) => {
    Logger.error("[sales-rep] salesRepTaskCounts failed:", err);
  });

  const counts = computed<SalesRepTaskCountsType>(() => ({
    today: result.value?.currentDay?.totalCount ?? 0,
    all: result.value?.all?.totalCount ?? 0,
    upcoming: result.value?.upcoming?.totalCount ?? 0,
    overdue: result.value?.overdue?.totalCount ?? 0,
    completed: result.value?.completed?.totalCount ?? 0,
  }));

  return { counts, loading, error, refetch };
}

/** The dashboard widget's overdue notice: one alias, not the four the tabs need. */
export function useSalesRepOverdueTaskCount() {
  const today = startOfLocalDayIso();

  const { result, onError } = useSalesRepHubQuery(
    SalesRepOverdueTaskCountDocument,
    computed(() => ({ today })),
    { fetchPolicy: HUB_FETCH_POLICY },
  );

  onError((err) => {
    Logger.error("[sales-rep] salesRepOverdueTaskCount failed:", err);
  });

  const overdueCount = computed(() => result.value?.overdue?.totalCount ?? 0);

  return { overdueCount };
}
