import { useQuery } from "@vue/apollo-composable";
import { computed, ref, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersDocument } from "../api/graphql/types";
import type { SalesRepCustomerType, SalesRepCustomerSortType } from "../types";

export const PAGE_SIZE = 10;

export function useSalesRepCustomers() {
  // `keyword` is the APPLIED search term (set on enter/click by the page, like the Sales reps
  // page) — not the live input. The reactive query refetches when it changes.
  const keyword = ref("");
  const sort = ref<SalesRepCustomerSortType>({ column: "name", direction: "asc" });
  const page = ref(1);

  const variables = computed(() => ({
    // A Sales Rep's account is store-bound; scope to the current store so customers from another
    // store don't leak in (server defaults to all stores when omitted).
    storeId: globals.storeId,
    first: PAGE_SIZE,
    // xAPI connections accept the offset as the cursor (host-wide convention).
    after: String((page.value - 1) * PAGE_SIZE),
    keyword: keyword.value,
    sort: `${sort.value.column}:${sort.value.direction}`,
  }));

  // The rep (and thus the set of customer organizations) is resolved server-side from the
  // caller's claims — no org variable. Locked memberships are excluded server-side.
  const { result, loading, onError } = useQuery(SalesRepCustomersDocument, variables, {
    keepPreviousResult: true,
  });

  onError((error) => {
    // Keep the page functional (empty list + empty view); no toasts by design.
    Logger.error("[sales-rep] salesRepCustomers failed:", error);
  });

  const items = computed<SalesRepCustomerType[]>(() =>
    (result.value?.salesRepCustomers?.items ?? []).map((customer) => ({
      organizationId: customer.organizationId,
      organizationName: customer.organizationName ?? "",
      // Skip the order block entirely when the org has never ordered, or the order id is missing.
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

  // If the result set shrinks under the user (e.g. customers reassigned server-side, or the total
  // drops after a refetch) so the current page no longer exists, clamp back to the last valid
  // page — otherwise the page is stranded on an empty view with no way back.
  watch(pages, (total) => {
    if (page.value > total) {
      page.value = total;
    }
  });

  return { loading, keyword, sort, page, pages, items };
}
