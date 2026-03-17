import { useQuery } from "@vue/apollo-composable";
import { GetCurrentUserAddressesDocument } from "@/core/api/graphql/types";
import type { GetCurrentUserAddressesQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useGetCurrentCustomerAddressesQuery(variables?: MaybeRef<GetCurrentUserAddressesQueryVariables>) {
  return useQuery(GetCurrentUserAddressesDocument, variables, { fetchPolicy: "network-only" });
}
