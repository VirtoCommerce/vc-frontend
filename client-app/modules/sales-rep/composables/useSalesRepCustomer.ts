import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerDocument } from "../api/graphql/types";
import type { SalesRepCustomerProfileType } from "../types/customer-profile";
import type { MaybeRefOrGetter } from "vue";

export function useSalesRepCustomer(organizationId: MaybeRefOrGetter<string>) {
  const variables = computed(() => ({ id: toValue(organizationId) }));

  const { result, loading, onError } = useQuery(SalesRepCustomerDocument, variables);

  onError((error) => {
    // Keep the page functional (renders the not-found state); no toasts, matching the module.
    Logger.error("[sales-rep] salesRepCustomer failed:", error);
  });

  // eslint-disable-next-line sonarjs/function-return-type -- view model or undefined by design
  const customer = computed<SalesRepCustomerProfileType | undefined>(() => {
    const node = result.value?.salesRepCustomer;
    return node ? { organizationId: node.organizationId, organizationName: node.organizationName ?? "" } : undefined;
  });

  // The rep doesn't serve this organization (server returns null), it doesn't exist, or the
  // request failed — all settle to the same "not found" view once loading finishes.
  const notFound = computed(() => !loading.value && !customer.value);

  return { customer, loading, notFound };
}
