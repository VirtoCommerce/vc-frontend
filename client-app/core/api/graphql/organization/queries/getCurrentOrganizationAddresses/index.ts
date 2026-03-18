import { useQuery } from "@vue/apollo-composable";
import { GetCurrentOrganizationAddressesDocument } from "@/core/api/graphql/types";
import type { GetCurrentOrganizationAddressesQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useGetCurrentOrganizationAddressesQuery(
  variables?: MaybeRef<GetCurrentOrganizationAddressesQueryVariables>,
) {
  return useQuery(GetCurrentOrganizationAddressesDocument, variables ?? {}, { fetchPolicy: "network-only" });
}
