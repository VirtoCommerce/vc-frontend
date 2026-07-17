import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepOrdersDocument } from "../api/graphql/types";
import { ORDERS_DEFAULT_LIMIT } from "../constants";
import type { SalesRepOrderRowType } from "../types";
import type { MaybeRefOrGetter } from "vue";

type UseSalesRepOrdersOptionsType = {
  // Scope to one customer; omit for cross-customer orders (the hub dashboard).
  organizationId?: MaybeRefOrGetter<string | undefined>;
  first?: MaybeRefOrGetter<number | undefined>;
};

export function useSalesRepOrders(options: UseSalesRepOrdersOptionsType = {}) {
  const variables = computed(() => ({
    organizationId: toValue(options.organizationId),
    // Scope to the rep's store so other-store orders don't leak in.
    storeId: globals.storeId,
    // Localize statusDisplayValue to the active culture.
    cultureName: globals.cultureName,
    // Most recent N; the full list lives on the "All orders" page.
    first: toValue(options.first) ?? ORDERS_DEFAULT_LIMIT,
    sort: "createdDate:desc",
  }));

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
