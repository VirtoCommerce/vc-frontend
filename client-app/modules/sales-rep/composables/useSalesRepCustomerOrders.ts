import { computed, ref, toValue, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { getFilterExpression } from "@/shared/account/composables/useUserOrdersFilter";
import { SalesRepCustomerOrdersDocument } from "../api/graphql/types";
import {
  CUSTOMER_ORDERS_SORT_DIRECTION,
  HUB_FETCH_POLICY,
  ORDER_STATUS_FACET,
  CUSTOMER_ORDERS_SORT_FIELDS,
} from "../constants";
import { toOrderStatusOptions, toSalesRepCustomerOrderRows } from "../utils";
import { useSalesRepCustomer } from "./useSalesRepCustomer";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepOrdersFilterDataType, SalesRepRuleType } from "../types";
import type { MaybeRefOrGetter } from "vue";

export const PAGE_SIZE = 10;

// Both sortable columns read newest/biggest first and reverse freely, so the expression always carries a
// direction — a bare field name would mean ascending to the backend.
const SORT_RULES: SalesRepRuleType[] = Object.values(CUSTOMER_ORDERS_SORT_FIELDS).map((name) => ({
  name,
  label: name,
  defaultDirection: CUSTOMER_ORDERS_SORT_DIRECTION,
  supportsDirection: true,
}));

function withDirection(expression?: string): string | undefined {
  if (!expression) {
    return undefined;
  }
  const [field, direction = CUSTOMER_ORDERS_SORT_DIRECTION] = expression.split(":");
  return `${field}:${direction}`;
}

/**
 * The orders of one served customer, or of every customer the rep serves when no organization is given.
 * Unlike the dashboard's Recent orders, this list is not scoped to the orders the rep placed — it is the
 * customer's whole history (VCST-5733). Statuses, their counts and the search all ride one request: the
 * status options come back as the list's own facet.
 */
export function useSalesRepCustomerOrders(organizationId?: MaybeRefOrGetter<string | undefined>) {
  const orgId = () => toValue(organizationId);
  const hasCustomer = computed(() => Boolean(orgId()));

  const {
    customer,
    loading: customerLoading,
    notFound,
  } = useSalesRepCustomer(() => orgId() ?? "", {
    enabled: hasCustomer,
  });

  // Applied search term (committed on enter/click by the page), not the live input.
  const keyword = ref("");
  // Applied Filters-panel state: selected statuses and date-only bounds.
  const filters = ref<SalesRepOrdersFilterDataType>({ statuses: [], startDate: undefined, endDate: undefined });
  // Selected sort expression ("createdDate:desc"); undefined → the server default.
  const sortRule = ref<string | undefined>(undefined);
  const page = ref(1);

  // One search phrase carries the keyword, the status union and the created-date range — the same syntax the
  // storefront's own order list builds.
  const filterExpression = computed(() => getFilterExpression(keyword.value, filters.value));

  const variables = computed(() => ({
    organizationId: orgId(),
    // Scope to the rep's store so other-store orders don't leak in.
    storeId: globals.storeId,
    // Localizes statusDisplayValue and the facet labels.
    cultureName: globals.cultureName,
    first: PAGE_SIZE,
    // xAPI connections accept the offset as the cursor (host-wide convention).
    after: String((page.value - 1) * PAGE_SIZE),
    sort: withDirection(sortRule.value),
    filter: filterExpression.value,
    facet: ORDER_STATUS_FACET,
  }));

  // Orders are placed outside the storefront, so the list revalidates rather than serving the one it
  // first loaded; keepPreviousResult holds the current page while it does.
  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerOrdersDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the page's failure view names it instead (VCST-5586).
    Logger.error("[sales-rep] salesRepCustomerOrders failed:", err);
  });

  const orders = computed(() => toSalesRepCustomerOrderRows(result.value?.salesRepCustomerOrders?.items));

  const statusOptions = computed(() => toOrderStatusOptions(result.value?.salesRepCustomerOrders?.term_facets));

  const pages = computed(() =>
    Math.max(1, Math.ceil((result.value?.salesRepCustomerOrders?.totalCount ?? 0) / PAGE_SIZE)),
  );

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
    hasCustomer,
    notFound,
    orders,
    statusOptions,
    sortRules: SORT_RULES,
    loading: computed(() => loading.value || customerLoading.value),
    failed: computed(() => Boolean(error.value)),
    page,
    pages,
    keyword,
    filters,
    sortRule,
  };
}
