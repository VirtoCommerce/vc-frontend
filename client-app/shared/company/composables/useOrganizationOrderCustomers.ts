import { computed, toValue } from "vue";
import { useGetOrganizationOrderCustomersQuery } from "@/core/api/graphql/orders";
import { globals } from "@/core/globals";
import { escapeFilterSyntaxValue, Logger } from "@/core/utilities";
import type { MaybeRefOrGetter } from "vue";

const CUSTOMER_FACET = "customerid";

/**
 * The accounts that have placed orders for the organization in the current store, from the order index: one request,
 * no order rows. `undefined` until known, and after a failure.
 */
export function useOrganizationOrderCustomers(organizationId: MaybeRefOrGetter<string | undefined>) {
  const variables = computed(() => ({
    organizationId: toValue(organizationId),
    filter: `storeid:"${escapeFilterSyntaxValue(globals.storeId)}"`,
  }));

  const { result, loading, error, onError } = useGetOrganizationOrderCustomersQuery(variables);

  onError((queryError) => {
    Logger.error("[company] organization order customers failed:", queryError);
  });

  const customerIds = computed<ReadonlySet<string> | undefined>(() => {
    const facets = result.value?.organizationOrders?.term_facets;
    if (!facets) {
      return undefined;
    }
    const terms = facets.find((facet) => facet.name.toLowerCase() === CUSTOMER_FACET)?.terms ?? [];
    // The index stores ids as it was given them; accounts compare without case, as the platform does.
    return new Set(terms.map((term) => term.term.toLowerCase()));
  });

  return { customerIds, loading, failed: computed(() => error.value != null) };
}
