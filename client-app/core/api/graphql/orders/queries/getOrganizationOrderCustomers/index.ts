import { useQuery } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetOrganizationOrderCustomersDocument } from "@/core/api/graphql/types";
import type { GetOrganizationOrderCustomersQueryVariables } from "@/core/api/graphql/types";
import type { Ref } from "vue";

/**
 * The accounts that have ordered for the organization. Notifications are suppressed: a failure only leaves the member
 * picker unfiltered. `cache-and-network`: a revisit filters at once from the cache while the network refreshes it.
 */
export function useGetOrganizationOrderCustomersQuery(variables: Ref<GetOrganizationOrderCustomersQueryVariables>) {
  return useQuery(GetOrganizationOrderCustomersDocument, variables, {
    fetchPolicy: "cache-and-network",
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });
}
