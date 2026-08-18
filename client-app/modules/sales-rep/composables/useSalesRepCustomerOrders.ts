import { computed, ref, toValue, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepOrdersDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { toSalesRepOrderRows } from "../utils";
import { useSalesRepCustomer } from "./useSalesRepCustomer";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { MaybeRefOrGetter } from "vue";

export const PAGE_SIZE = 10;

export function useSalesRepCustomerOrders(organizationId: MaybeRefOrGetter<string>) {
  const orgId = () => toValue(organizationId);

  const { customer, loading: customerLoading, notFound } = useSalesRepCustomer(orgId);

  // Applied search term (committed on enter/click by the page), not the live input.
  const keyword = ref("");
  // Selected order filter-rule name (a status set); undefined → the "All" baseline.
  const filter = ref<string | undefined>(undefined);
  // Selected sort-rule name, optionally suffixed ":asc"/":desc"; undefined → the server default.
  const sortRule = ref<string | undefined>(undefined);
  const page = ref(1);

  const variables = computed(() => ({
    organizationId: orgId(),
    // Scope to the rep's store so other-store orders don't leak in.
    storeId: globals.storeId,
    // Localize statusDisplayValue to the active culture.
    cultureName: globals.cultureName,
    first: PAGE_SIZE,
    // xAPI connections accept the offset as the cursor (host-wide convention).
    after: String((page.value - 1) * PAGE_SIZE),
    keyword: keyword.value,
    sort: sortRule.value,
    filter: filter.value,
  }));

  // Orders are placed outside the storefront, so the list revalidates rather than serving the one it
  // first loaded; keepPreviousResult holds the current page while it does.
  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepOrdersDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the page's failure view names it instead (VCST-5586).
    Logger.error("[sales-rep] salesRepOrders failed:", err);
  });

  const orders = computed(() => toSalesRepOrderRows(result.value?.salesRepOrders?.items));

  const pages = computed(() => Math.max(1, Math.ceil((result.value?.salesRepOrders?.totalCount ?? 0) / PAGE_SIZE)));

  // Clamp back to the last valid page when the set shrinks below the current page.
  watch(pages, (total) => {
    if (page.value > total) {
      page.value = total;
    }
  });

  // Switching customers restarts the list rather than landing on a page that may not exist there.
  watch(orgId, () => {
    page.value = 1;
  });

  return {
    customer,
    notFound,
    orders,
    loading: computed(() => loading.value || customerLoading.value),
    failed: computed(() => Boolean(error.value)),
    page,
    pages,
    keyword,
    filter,
    sortRule,
  };
}
