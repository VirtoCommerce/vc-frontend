import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerBrowsedProductsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY, INSIGHTS_DEFAULT_ROWS } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepBrowsedProductRowType } from "../types/insights";
import type { Ref } from "vue";

// Expanded unions (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
type UseSalesRepBrowseHistoryOptionsType = {
  organizationId: string | Ref<string> | (() => string);
  // "count" (top) or "date" (recent), from the salesRepCustomerInsights contract.
  sort?: string | Ref<string | undefined> | (() => string | undefined);
  periodFrom?: string | Ref<string | undefined> | (() => string | undefined);
  periodTo?: string | Ref<string | undefined> | (() => string | undefined);
  take?: number | Ref<number | undefined> | (() => number | undefined);
};

// Owns the browsedProducts half of the salesRepCustomerInsights op (VCST-5337).
export function useSalesRepBrowseHistory(options: UseSalesRepBrowseHistoryOptionsType) {
  const variables = computed(() => ({
    organizationId: toValue(options.organizationId),
    storeId: globals.storeId,
    cultureName: globals.cultureName,
    sort: toValue(options.sort),
    periodFrom: toValue(options.periodFrom),
    periodTo: toValue(options.periodTo),
    take: toValue(options.take) ?? INSIGHTS_DEFAULT_ROWS,
  }));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerBrowsedProductsDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    Logger.error("[sales-rep] salesRepCustomerInsights browsedProducts failed:", err);
  });

  const payload = computed(() => result.value?.salesRepCustomerInsights);

  // Null payload = no insights provider for the store — an expected state, not an error.
  const notConfigured = computed(() => Boolean(result.value) && !payload.value);

  const dataAsOf = computed(() => payload.value?.dataAsOf as string | undefined);

  const items = computed<SalesRepBrowsedProductRowType[]>(() =>
    (payload.value?.browsedProducts ?? []).map((row) => ({
      productId: row.productId,
      name: row.name ?? "",
      sku: row.sku ?? "",
      imageUrl: row.imageUrl ?? "",
      slug: row.slug,
      viewCount: row.viewCount,
      lastViewedDate: row.lastViewedDate as string | undefined,
    })),
  );

  return { items, notConfigured, dataAsOf, loading, error };
}
