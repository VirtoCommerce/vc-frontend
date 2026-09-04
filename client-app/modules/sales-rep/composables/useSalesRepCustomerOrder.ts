import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useOrderView } from "@/shared/account/composables/useOrderView";
import { SalesRepCustomerOrderDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useSalesRepCustomerOrder(orderId: MaybeRefOrGetter<string>) {
  const variables = computed(() => ({ id: toValue(orderId), cultureName: globals.cultureName }));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerOrderDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    Logger.error("[sales-rep] salesRepCustomerOrder failed:", err);
  });

  const order = computed(() => result.value?.salesRepCustomerOrder as CustomerOrderType | undefined);

  // A failed read says nothing about whether the order exists or is the rep's to see, so the page
  // words it differently - the toast is opted out of, and this is the only signal it gets.
  const failed = computed(() => Boolean(error.value));

  const notFound = computed(() => !loading.value && !failed.value && !order.value);

  return {
    order,
    loading,
    failed,
    notFound,
    ...useOrderView(order),
  };
}
