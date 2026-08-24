import { computed, toValue } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { formatCustomerLocation } from "../utils";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepCustomerProfileType } from "../types/customer-profile";
import type { MaybeRefOrGetter } from "vue";

type OptionsType = {
  enabled?: MaybeRefOrGetter<boolean>;
};

export function useSalesRepCustomer(organizationId: MaybeRefOrGetter<string>, options: OptionsType = {}) {
  const enabled = computed(() => toValue(options.enabled) ?? true);
  const variables = computed(() => ({ organizationId: toValue(organizationId) }));

  // The header is editable outside the storefront, so it revalidates too. Three components on the page
  // share this composable; Apollo's deduplication collapses their concurrent identical requests into one.
  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepCustomerDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
    enabled,
  });

  onError((queryError) => {
    // No toast; the page names the failure itself.
    Logger.error("[sales-rep] salesRepCustomer failed:", queryError);
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

  // A failed read says nothing about whether the rep serves this customer, so the page words it differently.
  const failed = computed(() => Boolean(error.value));

  // Not served / unknown settle to the not-found view once loading finishes.
  const notFound = computed(() => enabled.value && !loading.value && !failed.value && !customer.value);

  return { customer, loading, failed, notFound };
}
