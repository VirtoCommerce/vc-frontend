import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepOrdersDocument } from "../api/graphql/types";
import { CUSTOMER_PROFILE_ORDERS_LIMIT } from "../constants";
import type { SalesRepCustomerOrderType } from "../types/customer-profile";
import type { MaybeRefOrGetter } from "vue";

export function useSalesRepCustomerOrders(customerId: MaybeRefOrGetter<string>) {
  const variables = computed(() => ({
    customerId: toValue(customerId),
    // A Sales Rep's account is store-bound; scope so orders from another store don't leak in.
    storeId: globals.storeId,
    // Only the most recent N; the full paginated list is a separate "All orders" page (future).
    first: CUSTOMER_PROFILE_ORDERS_LIMIT,
    sort: "createdDate:desc",
  }));

  const { result, loading, onError } = useQuery(SalesRepOrdersDocument, variables);

  onError((error) => {
    // Keep the block functional (empty view); no toasts, matching the module.
    Logger.error("[sales-rep] salesRepOrders failed:", error);
  });

  const orders = computed<SalesRepCustomerOrderType[]>(() =>
    (result.value?.salesRepOrders?.items ?? [])
      // A connection can surface null items at runtime; skip them so one bad row doesn't blank the list.
      .filter((order): order is NonNullable<typeof order> => order != null)
      .map((order) => ({
        id: order.id,
        number: order.number ?? "",
        createdDate: order.createdDate,
        status: order.status ?? "",
        itemsCount: order.itemsCount,
        total: order.total,
        currency: order.currency ?? "",
      })),
  );

  const totalCount = computed(() => result.value?.salesRepOrders?.totalCount ?? 0);

  return { orders, totalCount, loading };
}
