import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerActivitySummaryDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepCustomerActivitySummaryType } from "../types";
import type { MaybeRefOrGetter, Ref } from "vue";

// Expanded unions (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
type UseSalesRepCustomerActivitySummaryOptionsType = {
  // Bounds the period-scoped figures (visitsCount); omit for lifetime.
  periodFrom?: string | Ref<string | undefined> | (() => string | undefined);
  periodTo?: string | Ref<string | undefined> | (() => string | undefined);
};

// Owns the salesRepCustomerActivitySummary op. A foreign/unauthorized organizationId nulls the whole
// field (like the statistics queries); analytics absence is `isAnalyticsConfigured: false` with the
// GA-sourced fields null/0 while `createdOn` still comes from the DB — never an error.
export function useSalesRepCustomerActivitySummary(
  organizationId: MaybeRefOrGetter<string>,
  options: UseSalesRepCustomerActivitySummaryOptionsType = {},
) {
  const variables = computed(() => ({
    organizationId: toValue(organizationId),
    // storeId scopes the analytics data and resolves lastViewedProduct's tracked code.
    storeId: globals.storeId,
    cultureName: globals.cultureName,
    periodFrom: toValue(options.periodFrom),
    periodTo: toValue(options.periodTo),
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
          lastViewedProduct: node.lastViewedProduct
            ? {
                code: node.lastViewedProduct.code,
                productId: node.lastViewedProduct.productId ?? "",
                name: node.lastViewedProduct.name ?? "",
                imageUrl: node.lastViewedProduct.imageUrl ?? "",
              }
            : undefined,
          isAnalyticsConfigured: node.isAnalyticsConfigured,
        }
      : undefined;
  });

  return { summary, loading, error };
}
