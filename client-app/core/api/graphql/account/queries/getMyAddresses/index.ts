import { GetMyAddressesDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { GetMyAddressesQueryVariables, MemberAddressFieldsFragment } from "@/core/api/graphql/types";

export async function getMyAddresses(payload?: GetMyAddressesQueryVariables): Promise<MemberAddressFieldsFragment[]> {
  const { data } = await graphqlClient.query({
    query: GetMyAddressesDocument,
    variables: payload,
  });

  return data.currentCustomerAddresses?.items ?? [];
}
