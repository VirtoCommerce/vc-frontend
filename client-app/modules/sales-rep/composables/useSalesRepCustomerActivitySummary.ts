import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerActivitySummaryDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepCustomerActivitySummaryType } from "../types";
import type { MaybeRefOrGetter } from "vue";

// An unauthorized organizationId nulls the whole field; unavailable analytics is `isAnalyticsAvailable: false`
// with the GA fields null/0 and `createdOn` (DB data) intact — never an error.
// Lifetime: no period, so visitsCount counts every visit.
export function useSalesRepCustomerActivitySummary(organizationId: MaybeRefOrGetter<string>) {
  const variables = computed(() => ({
    organizationId: toValue(organizationId),
    // storeId scopes the analytics data and resolves lastViewedProduct's tracked code.
    storeId: globals.storeId,
    cultureName: globals.cultureName,
  }));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerActivitySummaryDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the widget names the failure inline (VCST-5586).
    Logger.error("[sales-rep] salesRepCustomerActivitySummary failed:", err);
  });

  const summary = computed<SalesRepCustomerActivitySummaryType | undefined>(() => {
    const node = result.value?.salesRepCustomerActivitySummary;
    return node
      ? {
          createdOn: (node.createdOn as string | undefined) ?? undefined,
          lastWebLogin: (node.lastWebLogin as string | undefined) ?? undefined,
          visitsCount: node.visitsCount,
          lastSearchTerm: node.lastSearchTerm ?? "",
          lastSearchedDate: (node.lastSearchedDate as string | undefined) ?? undefined,
          lastViewedProduct: node.lastViewedProduct
            ? {
                code: node.lastViewedProduct.code,
                productId: node.lastViewedProduct.productId ?? "",
                name: node.lastViewedProduct.name ?? "",
              }
            : undefined,
          lastViewedDate: (node.lastViewedDate as string | undefined) ?? undefined,
          isAnalyticsAvailable: node.isAnalyticsAvailable,
        }
      : undefined;
  });

  return { summary, loading, error };
}
