import { computed } from "vue";
import { useOrganizationMemberOptions } from "./useOrganizationMemberOptions";
import { useOrganizationOrderCustomers } from "./useOrganizationOrderCustomers";
import type { OrganizationMemberOptionType } from "./useOrganizationMemberOptions";
import type { MaybeRefOrGetter } from "vue";

/**
 * The members worth picking in a sales report: those whose accounts have placed orders for the organization. Until
 * the orders are known, and when they cannot be read, every member is offered: a fuller picker beats a missing buyer.
 */
export function useOrganizationBuyerOptions(organizationId: MaybeRefOrGetter<string | undefined>) {
  const members = useOrganizationMemberOptions(organizationId);
  const orders = useOrganizationOrderCustomers(organizationId);

  const options = computed<OrganizationMemberOptionType[]>(() => {
    const customerIds = orders.customerIds.value;
    if (!customerIds) {
      return members.options.value;
    }
    return members.options.value.filter((member) =>
      member.accountIds.some((accountId) => customerIds.has(accountId.toLowerCase())),
    );
  });

  return {
    options,
    loading: computed(() => members.loading.value || (orders.customerIds.value === undefined && orders.loading.value)),
    failed: members.failed,
  };
}
