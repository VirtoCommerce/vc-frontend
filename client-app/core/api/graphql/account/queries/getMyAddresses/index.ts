import { GetMyAddressesDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { ContactTypeAddressesArgs, MemberAddressFieldsFragment } from "@/core/api/graphql/types";

export async function getMyAddresses(payload?: ContactTypeAddressesArgs): Promise<MemberAddressFieldsFragment[]> {
  const { data } = await graphqlClient.query({
    query: GetMyAddressesDocument,
    variables: {
      ...payload,
    },
  });

  return data.me?.contact?.addresses?.items ?? [];
}
