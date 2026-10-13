import { computed } from "vue";
import { SalesRepCustomerBrowsedProductsDocument } from "../api/graphql/types";
import { useSalesRepInsightsQuery } from "./useSalesRepInsightsQuery";
import type { UseSalesRepInsightsOptionsType } from "./useSalesRepInsightsQuery";
import type { SalesRepBrowsedProductRowType } from "../types/insights";

// Owns the browsedProducts half of the salesRepCustomerInsights op (VCST-5337).
export function useSalesRepBrowseHistory(options: UseSalesRepInsightsOptionsType) {
  const { result, unavailable, loading, error } = useSalesRepInsightsQuery(
    SalesRepCustomerBrowsedProductsDocument,
    options,
    "browsedProducts",
  );

  const items = computed<SalesRepBrowsedProductRowType[]>(() =>
    (result.value?.salesRepCustomerInsights?.browsedProducts ?? []).map((row) => ({
      productId: row.productId ?? "",
      name: row.name ?? "",
      sku: row.sku ?? "",
      imageUrl: row.imageUrl ?? "",
      // No productId for a tracked code that matches no product: such a row must not deep-link.
      isResolved: Boolean(row.productId),
      viewCount: row.viewCount,
      lastViewedDate: row.lastViewedDate as string | undefined,
    })),
  );

  return { items, unavailable, loading, error };
}
