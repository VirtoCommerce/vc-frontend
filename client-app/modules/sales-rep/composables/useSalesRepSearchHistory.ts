import { computed } from "vue";
import { SalesRepCustomerSearchTermsDocument } from "../api/graphql/types";
import { useSalesRepInsightsQuery } from "./useSalesRepInsightsQuery";
import type { UseSalesRepInsightsOptionsType } from "./useSalesRepInsightsQuery";
import type { SalesRepSearchTermRowType } from "../types/insights";

// Owns the searchTerms half of the salesRepCustomerInsights op (VCST-5337).
export function useSalesRepSearchHistory(options: UseSalesRepInsightsOptionsType) {
  const { result, unavailable, loading, error } = useSalesRepInsightsQuery(
    SalesRepCustomerSearchTermsDocument,
    options,
    "searchTerms",
  );

  const items = computed<SalesRepSearchTermRowType[]>(() =>
    (result.value?.salesRepCustomerInsights?.searchTerms ?? []).map((row) => ({
      term: row.term,
      count: row.count,
      lastSearchedDate: row.lastSearchedDate as string | undefined,
    })),
  );

  return { items, unavailable, loading, error };
}
