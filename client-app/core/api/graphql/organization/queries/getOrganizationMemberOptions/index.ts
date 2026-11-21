import { useQuery } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetOrganizationMemberOptionsDocument } from "@/core/api/graphql/types";
import type { GetOrganizationMemberOptionsQueryVariables } from "@/core/api/graphql/types";
import type { Ref } from "vue";

/**
 * The organization's members for a picker. Notifications are suppressed: the picker names its own failure.
 * `cache-and-network`: members change rarely, so a revisit shows the cached list at once and the network refreshes it.
 */
export function useGetOrganizationMemberOptionsQuery(variables: Ref<GetOrganizationMemberOptionsQueryVariables>) {
  return useQuery(GetOrganizationMemberOptionsDocument, variables, {
    fetchPolicy: "cache-and-network",
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });
}
