import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepOrdersDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY, ORDERS_DEFAULT_LIMIT } from "../constants";
import { toSalesRepOrderRows } from "../utils";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
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
  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepOrdersDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the widget's empty view names the failure instead (VCST-5586).
    Logger.error("[sales-rep] salesRepOrders failed:", err);
  });

  const orders = computed(() => toSalesRepOrderRows(result.value?.salesRepOrders?.items));

  return { orders, loading, error };
}
