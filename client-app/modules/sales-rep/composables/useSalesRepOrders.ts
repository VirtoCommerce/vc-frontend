import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepOrdersDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY, ORDERS_DEFAULT_LIMIT } from "../constants";
import type { SalesRepOrderRowType } from "../types";
import type { Ref } from "vue";

type UseSalesRepOrdersOptionsType = {
  // Scope to one customer; omit for cross-customer orders (the hub dashboard).
  // Expanded (not MaybeRefOrGetter<… | undefined>) so the `?` isn't a redundant second
  // "undefined" — Sonar S4782; getters/refs still yield undefined (see useProducts.ts).
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
  first?: number | Ref<number | undefined> | (() => number | undefined);
  // A salesRepOrderFilterRules name (a status set); omit for the baseline (all the rep's orders).
  filter?: string | Ref<string | undefined> | (() => string | undefined);
  // A salesRepOrderSortRules name; omit for the server default ("recent", newest first).
  sort?: string | Ref<string | undefined> | (() => string | undefined);
  // Optional created-date window (ISO strings) passed inline as period { from, to }.
  periodFrom?: string | Ref<string | undefined> | (() => string | undefined);
  periodTo?: string | Ref<string | undefined> | (() => string | undefined);
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
    // A named sort rule; undefined lets the server apply its default ("recent").
    sort: toValue(options.sort),
    // A named filter rule; undefined → the baseline (all the rep's orders, security-scoped).
    filter: toValue(options.filter),
    periodFrom: toValue(options.periodFrom),
    periodTo: toValue(options.periodTo),
  }));

  // Revalidates with the KPI cards above it: a stale row read "New" under a card already counting 0.
  const { result, loading, onError } = useQuery(SalesRepOrdersDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

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
