import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerDocument } from "../api/graphql/types";
import { formatCustomerLocation } from "../utils";
import type { SalesRepCustomerProfileType } from "../types/customer-profile";
import type { MaybeRefOrGetter } from "vue";

export function useSalesRepCustomer(organizationId: MaybeRefOrGetter<string>) {
  const variables = computed(() => ({ organizationId: toValue(organizationId) }));

  const { result, loading, onError } = useQuery(SalesRepCustomerDocument, variables);

  onError((error) => {
    // No toast; the page falls back to the not-found view.
    Logger.error("[sales-rep] salesRepCustomer failed:", error);
  });

  // eslint-disable-next-line sonarjs/function-return-type -- view model or undefined by design
  const customer = computed<SalesRepCustomerProfileType | undefined>(() => {
    const node = result.value?.salesRepCustomer;
    return node
      ? {
          organizationId: node.organizationId,
          organizationName: node.organizationName ?? "",
          iconUrl: node.iconUrl ?? "",
          accountType: node.accountType ?? "",
          phone: node.phone ?? "",
          shipTo: formatCustomerLocation(node.address),
          primaryContactName: node.primaryContact?.fullName || node.primaryContact?.name || "",
        }
      : undefined;
  });

  // Not served / unknown / errored all settle to the same not-found view once loading finishes.
  const notFound = computed(() => !loading.value && !customer.value);

  return { customer, loading, notFound };
}
