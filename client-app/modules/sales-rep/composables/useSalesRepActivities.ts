import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepActivitiesDocument } from "../api/graphql/types";
import { ACTIVITY_PAGE_SIZE, HUB_FETCH_POLICY } from "../constants";
import { formatStatMoney } from "../utils";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepActivityCategoryCountType, SalesRepActivityItemType } from "../types";
import type { Ref } from "vue";

// Expanded unions (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
type UseSalesRepActivitiesOptionsType = {
  // Scope to one customer; omit for the cross-customer feed ("my activity").
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
  // Category ids to include; omit for all categories.
  categories?: string[] | Ref<string[] | undefined> | (() => string[] | undefined);
  periodFrom?: string | Ref<string | undefined> | (() => string | undefined);
  periodTo?: string | Ref<string | undefined> | (() => string | undefined);
  // 0 is meaningful (counts only), so ?? keeps it — the default applies only to an absent option.
  take?: number | Ref<number | undefined> | (() => number | undefined);
  skip?: number | Ref<number | undefined> | (() => number | undefined);
};

// Owns the salesRepActivities op: a merged, newest-first feed of order/customer events (exact) and
// analytics hour-buckets (searches, product views, logins). Unauthorized org / analytics absence are
// nulls and zero counts by contract, never errors.
export function useSalesRepActivities(options: UseSalesRepActivitiesOptionsType = {}) {
  const variables = computed(() => ({
    organizationId: toValue(options.organizationId),
    // Scope to the rep's store so other-store activity doesn't leak in; also resolves tracked product codes.
    storeId: globals.storeId,
    // Localize orderStatusDisplayValue to the active culture.
    cultureName: globals.cultureName,
    categories: toValue(options.categories),
    periodFrom: toValue(options.periodFrom),
    periodTo: toValue(options.periodTo),
    take: toValue(options.take) ?? ACTIVITY_PAGE_SIZE,
    skip: toValue(options.skip) ?? 0,
  }));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepActivitiesDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; each surface names the failure inline (VCST-5586).
    Logger.error("[sales-rep] salesRepActivities failed:", err);
  });

  const items = computed<SalesRepActivityItemType[]>(() =>
    (result.value?.salesRepActivities?.items ?? []).map((event) => ({
      category: event.category,
      type: event.type,
      occurredAt: event.occurredAt as string,
      precision: event.precision === "hour" ? "hour" : "exact",
      count: event.count ?? 1,
      organizationId: event.organizationId ?? "",
      organizationName: event.organizationName ?? "",
      orderId: event.orderId ?? "",
      orderNumber: event.orderNumber ?? "",
      status: event.orderStatus ?? "",
      statusDisplayValue: event.orderStatusDisplayValue ?? "",
      // Only format when the row carries money — formatStatMoney would render a currency zero.
      orderTotal: event.orderTotal ? formatStatMoney(event.orderTotal) : "",
      searchTerm: event.searchTerm ?? "",
      productId: event.productId ?? "",
      productCode: event.productCode ?? "",
      productName: event.productName ?? "",
      productImageUrl: event.productImageUrl ?? "",
    })),
  );

  const categoryCounts = computed<SalesRepActivityCategoryCountType[]>(() =>
    (result.value?.salesRepActivities?.categoryCounts ?? []).map(({ category, count }) => ({ category, count })),
  );

  const totalCount = computed(() => result.value?.salesRepActivities?.totalCount ?? 0);

  return { items, categoryCounts, totalCount, loading, error };
}
