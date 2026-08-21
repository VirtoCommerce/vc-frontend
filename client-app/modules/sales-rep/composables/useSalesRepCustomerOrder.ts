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

  const { result, loading, onError } = useSalesRepHubQuery(SalesRepCustomerOrderDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    Logger.error("[sales-rep] salesRepCustomerOrder failed:", err);
  });

  const order = computed(() => result.value?.salesRepCustomerOrder as CustomerOrderType | undefined);

  const notFound = computed(() => !loading.value && !order.value);

  return {
    order,
    loading,
    notFound,
    ...useOrderView(order),
  };
}
