import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { formatCustomerLocation } from "../utils";
import type { SalesRepCustomerProfileType } from "../types/customer-profile";
import type { MaybeRefOrGetter } from "vue";

export function useSalesRepCustomer(organizationId: MaybeRefOrGetter<string>) {
  const variables = computed(() => ({ organizationId: toValue(organizationId) }));

  // The header is editable outside the storefront, so it revalidates too. Three components on the page
  // share this composable; Apollo's deduplication collapses their concurrent identical requests into one.
  const { result, loading, onError } = useQuery(SalesRepCustomerDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((error) => {
    // No toast; the page falls back to the not-found view.
    Logger.error("[sales-rep] salesRepCustomer failed:", error);
  });

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
