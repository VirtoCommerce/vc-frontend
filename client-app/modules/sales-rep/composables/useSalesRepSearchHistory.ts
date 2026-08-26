import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerSearchTermsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY, INSIGHTS_DEFAULT_ROWS } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepSearchTermRowType } from "../types/insights";
import type { Ref } from "vue";

// Expanded unions (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
type UseSalesRepSearchHistoryOptionsType = {
  organizationId: string | Ref<string> | (() => string);
  // "count" (top) or "date" (recent), from the salesRepCustomerInsights contract.
  sort?: string | Ref<string | undefined> | (() => string | undefined);
  periodFrom?: string | Ref<string | undefined> | (() => string | undefined);
  periodTo?: string | Ref<string | undefined> | (() => string | undefined);
  take?: number | Ref<number | undefined> | (() => number | undefined);
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

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerSearchTermsDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    Logger.error("[sales-rep] salesRepCustomerInsights searchTerms failed:", err);
  });

  const payload = computed(() => result.value?.salesRepCustomerInsights);

  // Null payload = no insights provider for the store — an expected state, not an error.
  const notConfigured = computed(() => Boolean(result.value) && !payload.value);

  const dataAsOf = computed(() => payload.value?.dataAsOf as string | undefined);

  const items = computed<SalesRepSearchTermRowType[]>(() =>
    (payload.value?.searchTerms ?? []).map((row) => ({
      term: row.term,
      count: row.count,
      lastSearchedDate: row.lastSearchedDate as string | undefined,
    })),
  );

  return { items, notConfigured, dataAsOf, loading, error };
}
