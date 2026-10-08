import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerSearchTermsDocument } from "../api/graphql/types";
import { INSIGHTS_DEFAULT_ROWS } from "../constants";
import { latestDate } from "../utils";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepSearchTermRowType } from "../types/insights";
import type { Ref } from "vue";

// Expanded unions (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
type UseSalesRepSearchHistoryOptionsType = {
  // Scope to one customer; omit for insights aggregated across every organization the rep serves.
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
  // "count" (top) or "date" (recent), from the salesRepCustomerInsights contract.
  sort?: string | Ref<string | undefined> | (() => string | undefined);
  periodFrom?: string | Ref<string | undefined> | (() => string | undefined);
  periodTo?: string | Ref<string | undefined> | (() => string | undefined);
  take?: number | Ref<number | undefined> | (() => number | undefined);
  // Apollo's `enabled`: lets a surface that shows the list on demand skip the query until then.
  enabled?: boolean | Ref<boolean>;
};

// Owns the searchTerms half of the salesRepCustomerInsights op (VCST-5337).
export function useSalesRepSearchHistory(options: UseSalesRepSearchHistoryOptionsType) {
  const variables = computed(() => ({
    organizationId: toValue(options.organizationId),
    storeId: globals.storeId,
    cultureName: globals.cultureName,
    sort: toValue(options.sort),
    periodFrom: toValue(options.periodFrom),
    periodTo: toValue(options.periodTo),
    take: toValue(options.take) ?? INSIGHTS_DEFAULT_ROWS,
  }));

  // Kept out of the cache: both insights ops write one salesRepCustomerInsights entry (same field, same arguments)
  // whose isAnalyticsAvailable answers for the collection that op selected — cached, each op overwrote the other.
  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerSearchTermsDocument, variables, {
    fetchPolicy: "no-cache",
    enabled: options.enabled ?? true,
  });

  onError((err) => {
    Logger.error("[sales-rep] salesRepCustomerInsights searchTerms failed:", err);
  });

  const payload = computed(() => result.value?.salesRepCustomerInsights);

  // One flag covers absent, unconfigured and failed; a null payload means the caller may not see this customer.
  const unavailable = computed(() => Boolean(result.value) && payload.value?.isAnalyticsAvailable === false);

  const items = computed<SalesRepSearchTermRowType[]>(() =>
    (payload.value?.searchTerms ?? []).map((row) => ({
      term: row.term,
      count: row.count,
      lastSearchedDate: row.lastSearchedDate as string | undefined,
    })),
  );

  const dataAsOf = computed(() => latestDate(items.value.map((row) => row.lastSearchedDate)));

  return { items, unavailable, dataAsOf, loading, error };
}
