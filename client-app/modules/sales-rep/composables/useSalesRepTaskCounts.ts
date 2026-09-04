import { computed } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepOverdueTaskCountDocument, SalesRepTaskCountsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { startOfLocalDayIso } from "../tasks";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepTaskCountsType } from "../types/tasks";
import type { Ref } from "vue";

/**
 * Badges for the All / Upcoming / Overdue / Completed chips, in ONE round trip: the query aliases
 * salesRepTasks four times with first: 0, so each alias returns only a totalCount. There is deliberately no
 * backend counts query — aliasing already gives a single request, and a bespoke field would have to
 * re-derive the same rules.
 *
 * `day` is the "All" badge: on the calendar page a status tab spans every date but "All" shows the selected day,
 * so its badge takes that day's window — the whole book would promise a hundred rows over a list of two.
 */
export function useSalesRepTaskCounts(dayWindow: Ref<{ from: string; to: string }>) {
  const today = startOfLocalDayIso();

  const { result, loading, error, onError, refetch } = useSalesRepHubQuery(
    SalesRepTaskCountsDocument,
    computed(() => ({ today, period: dayWindow.value })),
    { fetchPolicy: HUB_FETCH_POLICY },
  );

  onError((err) => {
    Logger.error("[sales-rep] salesRepTaskCounts failed:", err);
  });

  const counts = computed<SalesRepTaskCountsType>(() => ({
    day: result.value?.day?.totalCount ?? 0,
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
