import { useQuery } from "@vue/apollo-composable";
import { computed, ref, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersDocument } from "../api/graphql/types";
import { formatCustomerLocation } from "../utils";
import type { SalesRepCustomerType, SalesRepCustomerSortType } from "../types";

export const PAGE_SIZE = 10;

export function useSalesRepCustomers() {
  // Applied search term (committed on enter/click by the page), not the live input.
  const keyword = ref("");
  const sort = ref<SalesRepCustomerSortType>({ column: "name", direction: "asc" });
  const page = ref(1);

  const variables = computed(() => ({
    // Scope to the current store so customers from other stores don't leak in.
    storeId: globals.storeId,
    first: PAGE_SIZE,
    // xAPI connections take the offset as the cursor.
    after: String((page.value - 1) * PAGE_SIZE),
    keyword: keyword.value,
    sort: `${sort.value.column}:${sort.value.direction}`,
  }));

  // The rep's customer organizations are resolved server-side from the caller's claims.
  const { result, loading, onError } = useQuery(SalesRepCustomersDocument, variables, {
    keepPreviousResult: true,
  });

  onError((error) => {
    // Keep the page functional (empty view); no toasts by design.
    Logger.error("[sales-rep] salesRepCustomers failed:", error);
  });

  const items = computed<SalesRepCustomerType[]>(() =>
    (result.value?.salesRepCustomers?.items ?? []).map((customer) => ({
      organizationId: customer.organizationId,
      organizationName: customer.organizationName ?? "",
      location: formatCustomerLocation(customer.address, { withPostalCode: true }),
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

  return { loading, keyword, sort, page, pages, items };
}
