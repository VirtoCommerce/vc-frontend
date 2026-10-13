import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { INSIGHTS_DEFAULT_ROWS } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepCustomerSearchTermsQueryVariables } from "../api/graphql/types";
import type { TypedDocumentNode } from "@apollo/client/core";
import type { Ref } from "vue";

// Expanded unions (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
export type UseSalesRepInsightsOptionsType = {
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

type InsightsQueryType = { salesRepCustomerInsights?: { isAnalyticsAvailable: boolean } };

// The browsedProducts op takes the same arguments.
type InsightsVariablesType = SalesRepCustomerSearchTermsQueryVariables;

// What the two salesRepCustomerInsights ops share, one op per collection (VCST-5337).
export function useSalesRepInsightsQuery<TResult extends InsightsQueryType>(
  document: TypedDocumentNode<TResult, InsightsVariablesType>,
  options: UseSalesRepInsightsOptionsType,
  collection: string,
) {
  const variables = computed<InsightsVariablesType>(() => ({
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
  const { result, loading, error, onError } = useSalesRepHubQuery(document, variables, {
    fetchPolicy: "no-cache",
    enabled: options.enabled ?? true,
  });

  onError((err) => {
    Logger.error(`[sales-rep] salesRepCustomerInsights ${collection} failed:`, err);
  });

  // One flag covers absent, unconfigured and failed; a null payload means the caller may not see this customer.
  const unavailable = computed(
    () => Boolean(result.value) && result.value?.salesRepCustomerInsights?.isAnalyticsAvailable === false,
  );

  return { result, unavailable, loading, error };
}
