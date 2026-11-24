import { useQuery } from "@vue/apollo-composable";
import { GetOrganizationReturnsDocument } from "@/modules/returns/api/graphql/types";
import type { GetOrganizationReturnsQueryVariables } from "@/modules/returns/api/graphql/types";
import type { MaybeRef, MaybeRefOrGetter } from "vue";

export function useGetOrganizationReturnsQuery(
  variables: MaybeRefOrGetter<GetOrganizationReturnsQueryVariables>,
  enabled?: MaybeRef<boolean>,
) {
  return useQuery(GetOrganizationReturnsDocument, variables, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    keepPreviousResult: true,
    enabled,
  });
}
