import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepTopSellersDocument } from "../api/graphql/types";
import { TOP_SELLERS_DEFAULT_TAKE } from "../constants";
import type { SalesRepTopSellerRowType } from "../types";
import type { Ref } from "vue";

// Expanded unions (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
type UseSalesRepTopSellersOptionsType = {
  // Scope to one customer; omit for the cross-customer dashboard ranking.
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
  // A salesRepTopSellerSortRules name (default server "by-units").
  sort?: string | Ref<string | undefined> | (() => string | undefined);
  // A salesRepTopSellerFilterRules name (a top-level category id).
  filter?: string | Ref<string | undefined> | (() => string | undefined);
  periodFrom?: string | Ref<string | undefined> | (() => string | undefined);
  periodTo?: string | Ref<string | undefined> | (() => string | undefined);
  take?: number | Ref<number | undefined> | (() => number | undefined);
};

// SOURCE: one composable owning the salesRepTopSellers op. Returns a ranked list (not a connection);
// name/sku/image come straight from the order line-item snapshot, revenue is backend-formatted Money.
export function useSalesRepTopSellers(options: UseSalesRepTopSellersOptionsType = {}) {
  const variables = computed(() => ({
    organizationId: toValue(options.organizationId),
    storeId: globals.storeId,
    cultureName: globals.cultureName,
    currencyCode: globals.currencyCode,
    sort: toValue(options.sort),
    filter: toValue(options.filter),
    periodFrom: toValue(options.periodFrom),
    periodTo: toValue(options.periodTo),
    take: toValue(options.take) ?? TOP_SELLERS_DEFAULT_TAKE,
  }));

  const { result, loading, onError } = useQuery(SalesRepTopSellersDocument, variables);

  onError((error) => {
    Logger.error("[sales-rep] salesRepTopSellers failed:", error);
  });

  const items = computed<SalesRepTopSellerRowType[]>(() =>
    (result.value?.salesRepTopSellers ?? [])
      .filter((row): row is NonNullable<typeof row> => row != null)
      .map((row) => ({
        rank: row.rank,
        productId: row.productId,
        name: row.name ?? "",
        sku: row.sku ?? "",
        imageUrl: row.imageUrl ?? "",
        units: row.units,
        revenue: row.revenue.formattedAmount,
      })),
  );

  return { items, loading };
}
