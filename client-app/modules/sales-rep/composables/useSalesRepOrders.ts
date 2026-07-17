import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepOrdersDocument } from "../api/graphql/types";
import { RECENT_ORDERS_LIMIT } from "../constants";
import type { SalesRepOrderRowType } from "../types";
import type { MaybeRefOrGetter } from "vue";

type UseSalesRepOrdersOptionsType = {
  // Scope to one customer; omit for cross-customer orders (the hub dashboard).
  organizationId?: MaybeRefOrGetter<string | undefined>;
  // Filter by order-status names (from salesRepOrderStatuses); omit/empty for "All".
  statuses?: MaybeRefOrGetter<string[] | undefined>;
  first?: MaybeRefOrGetter<number | undefined>;
};

export function useSalesRepOrders(options: UseSalesRepOrdersOptionsType = {}) {
  const variables = computed(() => {
    const statuses = toValue(options.statuses);
    return {
      organizationId: toValue(options.organizationId),
      // Scope to the rep's store so other-store orders don't leak in.
      storeId: globals.storeId,
      // undefined (not []) means "no status filter" — the "All" tab.
      statuses: statuses?.length ? statuses : undefined,
      // Most recent N; the full list lives on the "All orders" page.
      first: toValue(options.first) ?? RECENT_ORDERS_LIMIT,
      sort: "createdDate:desc",
    };
  });

  const { result, loading, onError } = useQuery(SalesRepOrdersDocument, variables);

  onError((error) => {
    // No toast; the block falls back to the empty view.
    Logger.error("[sales-rep] salesRepOrders failed:", error);
  });

  const orders = computed<SalesRepOrderRowType[]>(() =>
    (result.value?.salesRepOrders?.items ?? [])
      // Skip null connection items so one bad row doesn't blank the list.
      .filter((order): order is NonNullable<typeof order> => order != null)
      .map((order) => ({
        id: order.id,
        number: order.number ?? "",
        organizationId: order.organizationId ?? "",
        organizationName: order.organizationName ?? "",
        createdDate: order.createdDate,
        status: order.status ?? "",
        statusDisplayValue: order.statusDisplayValue ?? "",
        itemsCount: order.itemsCount,
        total: order.total.formattedAmount,
      })),
  );

  return { orders, loading };
}
