import { useQuery } from "@vue/apollo-composable";
import { computed, ref, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { buildStatisticsWindows, formatCustomerLocation, formatStatMoney } from "../utils";
import type { SalesRepCustomerType } from "../types";

export const PAGE_SIZE = 10;

export function useSalesRepCustomers() {
  // Applied search term (committed on enter/click by the page), not the live input.
  const keyword = ref("");
  // Selected customer filter-rule name (a segment); undefined → the "All" baseline.
  const filter = ref<string | undefined>(undefined);
  // Selected customer sort-rule name; undefined → the server default ("my-last-orders").
  const sortRule = ref<string | undefined>(undefined);
  const page = ref(1);

  // Windows resolved once per mount, not inside the variables computed — a fresh Date() on every
  // change would drift the bounds and bust Apollo's cache-first (windows are part of the cache key).
  const windows = buildStatisticsWindows();

  const variables = computed(() => ({
    // Scope to the current store so customers from other stores don't leak in.
    storeId: globals.storeId,
    first: PAGE_SIZE,
    // xAPI connections take the offset as the cursor.
    after: String((page.value - 1) * PAGE_SIZE),
    keyword: keyword.value,
    sort: sortRule.value,
    filter: filter.value,
    cultureName: globals.cultureName,
    // Inline YTD / prior-year purchase columns (batched server-side per page, no N+1).
    ytdFrom: windows.ytdFrom,
    ytdTo: windows.ytdTo,
    lastYearFrom: windows.lastYearFrom,
    lastYearTo: windows.lastYearTo,
  }));

  // The rep's customer organizations are resolved server-side from the caller's claims.
  // The YTD / prior-year columns are statistics in list form, so they revalidate with the cards;
  // keepPreviousResult holds the current page while they do.
  const { result, loading, error, onError } = useQuery(SalesRepCustomersDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the page's empty view names the failure instead (VCST-5586).
    Logger.error("[sales-rep] salesRepCustomers failed:", err);
  });

  const items = computed<SalesRepCustomerType[]>(() =>
    (result.value?.salesRepCustomers?.items ?? []).map((customer) => ({
      organizationId: customer.organizationId,
      organizationName: customer.organizationName ?? "",
      accountType: customer.accountType ?? "",
      location: formatCustomerLocation(customer.address, { withPostalCode: true }),
      ytdTotal: formatStatMoney(customer.ytd?.total),
      ytdCount: customer.ytd?.count ?? 0,
      lastYearTotal: formatStatMoney(customer.lastYear?.total),
      lastOrder: customer.lastOrder?.id
        ? {
            id: customer.lastOrder.id,
            number: customer.lastOrder.number ?? "",
            createdDate: customer.lastOrder.createdDate,
          }
        : undefined,
    })),
  );

  const pages = computed(() => Math.max(1, Math.ceil((result.value?.salesRepCustomers?.totalCount ?? 0) / PAGE_SIZE)));

  // Clamp back to the last valid page when the set shrinks below the current page.
  watch(pages, (total) => {
    if (page.value > total) {
      page.value = total;
    }
  });

  return { loading, error, keyword, filter, sortRule, page, pages, items };
}
