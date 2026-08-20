import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useOrderView } from "@/shared/account/composables/useOrderView";
import { SalesRepCustomerOrderDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

/**
 * One order of a served customer, read through the Sales Rep endpoint so the rep's own permission decides
 * what opens — the storefront's own order query answers for the signed-in buyer instead. Read-only: the
 * endpoint exposes no order mutations at all.
 */
export function useSalesRepCustomerOrder(orderId: MaybeRefOrGetter<string>) {
  const variables = computed(() => ({ id: toValue(orderId), cultureName: globals.cultureName }));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerOrderDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the page falls back to its not-found view.
    Logger.error("[sales-rep] salesRepCustomerOrder failed:", err);
  });

  // The selection is the storefront's own fullOrderFields fragment, so the shared order components render it
  // unchanged.
  const order = computed(() => result.value?.salesRepCustomerOrder as CustomerOrderType | undefined);

  // An order of a customer the rep does not serve reads as null, the same as an unknown id.
  const notFound = computed(() => !loading.value && !order.value);

  return {
    order,
    loading,
    notFound,
    failed: computed(() => Boolean(error.value)),
    ...useOrderView(order),
  };
}
