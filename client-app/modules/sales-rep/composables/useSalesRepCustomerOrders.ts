import { computed, ref, toValue, watch } from "vue";
import { STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { getFilterExpression } from "@/shared/account/composables/useUserOrdersFilter";
import { SalesRepCustomerOrdersDocument } from "../api/graphql/types";
import {
  CUSTOMER_ORDERS_SORT_DIRECTION,
  CUSTOMER_ORDERS_SORT_FIELDS,
  HUB_FETCH_POLICY,
  ORDER_CUSTOMER_FACET,
} from "../constants";
import { toFacetOptions, toSalesRepCustomerOrderRows } from "../utils";
import { useSalesRepCustomer } from "./useSalesRepCustomer";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepOrdersFilterDataType, SalesRepRuleType } from "../types";
import type { MaybeRefOrGetter } from "vue";

export const PAGE_SIZE = 10;

// Both sortable columns reverse freely, so the expression always carries a direction — a bare field name
// would mean ascending to the backend.
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

export function useSalesRepCustomerOrders(organizationId?: MaybeRefOrGetter<string | undefined>) {
  const orgId = () => toValue(organizationId);
  const hasCustomer = computed(() => Boolean(orgId()));

  const {
    customer,
    loading: customerLoading,
    failed: customerFailed,
    notFound,
  } = useSalesRepCustomer(() => orgId() ?? "", {
    enabled: hasCustomer,
  });

  const keyword = ref("");
  const filters = ref<SalesRepOrdersFilterDataType>({
    statuses: [],
    customerNames: [],
    startDate: undefined,
    endDate: undefined,
  });
  const sortRule = ref<string | undefined>(undefined);
  const page = ref(1);

  const filterExpression = computed(() => {
    const { customerNames = [], ...rest } = filters.value;
    // Held back from getFilterExpression: its own customerNames emits `customername`, the buyer who placed
    // the order, while this list groups by the organization the order belongs to.
    const phrase = getFilterExpression(keyword.value, rest);
    if (customerNames.length === 0) {
      return phrase;
    }

    const quoted = customerNames.map((name) => JSON.stringify(name)).join(",");
    const clause = `${ORDER_CUSTOMER_FACET}:${quoted}`;
    return phrase ? `${phrase} ${clause}` : clause;
  });

  const variables = computed(() => ({
    organizationId: orgId(),
    storeId: globals.storeId,
    cultureName: globals.cultureName,
    first: PAGE_SIZE,
    // xAPI connections accept the offset as the cursor (host-wide convention).
    after: String((page.value - 1) * PAGE_SIZE),
    sort: withDirection(sortRule.value),
    filter: filterExpression.value,
    facet: hasCustomer.value ? STATUS_ORDERS_FACET_NAME : `${STATUS_ORDERS_FACET_NAME} ${ORDER_CUSTOMER_FACET}`,
  }));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerOrdersDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    Logger.error("[sales-rep] salesRepCustomerOrders failed:", err);
  });

  const orders = computed(() => toSalesRepCustomerOrderRows(result.value?.salesRepCustomerOrders?.items));

  const facets = computed(() => result.value?.salesRepCustomerOrders?.term_facets);
  const statusOptions = computed(() => toFacetOptions(facets.value, STATUS_ORDERS_FACET_NAME));
  const customerOptions = computed(() => toFacetOptions(facets.value, ORDER_CUSTOMER_FACET));

  const pages = computed(() =>
    Math.max(1, Math.ceil((result.value?.salesRepCustomerOrders?.totalCount ?? 0) / PAGE_SIZE)),
  );

  watch(pages, (total) => {
    if (page.value > total) {
      page.value = total;
    }
  });

  // Both list routes render one component instance, so switching between them only changes the prop -
  // every piece of per-list state has to be reset here or it rides along into the other list.
  // flush "sync": Apollo's own variables watcher runs at the default pre flush, so without this the
  // reset lands after it and an org change fires a second request with the previous offset.
  watch(
    orgId,
    () => {
      page.value = 1;
      keyword.value = "";
      filters.value = { statuses: [], customerNames: [], startDate: undefined, endDate: undefined };
      sortRule.value = undefined;
    },
    { flush: "sync" },
  );

  return {
    customer,
    hasCustomer,
    notFound,
    orders,
    statusOptions,
    customerOptions,
    sortRules: SORT_RULES,
    loading: computed(() => loading.value || customerLoading.value),
    // Either read failing is a failure the page must name: a silent customer failure would otherwise
    // surface only as the fallback heading.
    failed: computed(() => Boolean(error.value) || customerFailed.value),
    page,
    pages,
    keyword,
    filters,
    sortRule,
  };
}
