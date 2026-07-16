import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepOrdersDocument } from "../api/graphql/types";
import { CUSTOMER_PROFILE_ORDERS_LIMIT } from "../constants";
import type { SalesRepCustomerOrderType } from "../types/customer-profile";
import type { MaybeRefOrGetter } from "vue";

export function useSalesRepCustomerOrders(organizationId: MaybeRefOrGetter<string>) {
  const variables = computed(() => ({
    organizationId: toValue(organizationId),
    // Scope to the rep's store so other-store orders don't leak in.
    storeId: globals.storeId,
    // Most recent N; the full list lives on the "All orders" page.
    first: CUSTOMER_PROFILE_ORDERS_LIMIT,
    sort: "createdDate:desc",
  }));

  const { result, loading, onError } = useQuery(SalesRepOrdersDocument, variables);

  onError((error) => {
    // No toast; the block falls back to the empty view.
    Logger.error("[sales-rep] salesRepOrders failed:", error);
  });

  const orders = computed<SalesRepCustomerOrderType[]>(() =>
    (result.value?.salesRepOrders?.items ?? [])
      // Skip null connection items so one bad row doesn't blank the list.
      .filter((order): order is NonNullable<typeof order> => order != null)
      .map((order) => ({
        id: order.id,
        number: order.number ?? "",
        createdDate: order.createdDate,
        status: order.status ?? "",
        itemsCount: order.itemsCount,
        total: order.total.formattedAmount,
      })),
  );

  return { orders, loading };
}
