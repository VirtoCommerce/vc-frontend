import { computed, readonly, ref, shallowRef } from "vue";
import { getOrders, getOrganizationOrders } from "@/core/api/graphql/orders";
import { CUSTOMER_NAME_FACET_NAME, DEFAULT_ORDERS_PER_PAGE, STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { Logger } from "@/core/utilities";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { OrderFacetType } from "@/shared/account";
import type { MaybeRef, Ref } from "vue";

export const facets = shallowRef<OrderFacetType[] | undefined>();

export interface IUseUserOrdersOptions {
  itemsPerPage?: MaybeRef<number>;
}

export function useUserOrders(options: IUseUserOrdersOptions) {
  const itemsPerPage = ref(options.itemsPerPage ?? DEFAULT_ORDERS_PER_PAGE);

  const orders: Ref<CustomerOrderType[]> = shallowRef<CustomerOrderType[]>([]);
  const loading: Ref<boolean> = ref(false);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");

  const sort: Ref<Sort> = ref(new Sort("createdDate", SortDirection.Descending));

  async function fetchOrders(scope: "private" | "organization" = "private", filterExpression: string = "") {
    loading.value = true;

    try {
      const payload = {
        sort: sort.value.toString(),
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        filter: filterExpression,
        facet:
          scope === "organization"
            ? `${STATUS_ORDERS_FACET_NAME} ${CUSTOMER_NAME_FACET_NAME}`
            : STATUS_ORDERS_FACET_NAME,
      };

      const response = scope === "organization" ? await getOrganizationOrders(payload) : await getOrders(payload);

      // TODO as CustomerOrderType[] and as OrderFacetType[] - infer them from query
      orders.value = (response?.items ?? []) as CustomerOrderType[];
      pages.value = Math.ceil((response?.totalCount ?? 0) / itemsPerPage.value);
      facets.value = response?.term_facets?.map((item) => ({ name: item.name, items: item.terms })) as OrderFacetType[];
    } catch (e) {
      Logger.error(`${useUserOrders.name}.${fetchOrders.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    sort,
    fetchOrders,
    loading: readonly(loading),
    orders: computed(() => orders.value),
    facets: computed(() => facets.value),
    itemsPerPage,
    pages,
    page,
    keyword,
  };
}
