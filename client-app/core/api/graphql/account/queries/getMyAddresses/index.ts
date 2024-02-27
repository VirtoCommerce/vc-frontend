import { graphqlClient } from "../../../client";
import { GetMyAddressesDocument } from "./getMyAddressesQuery.generated";
import type { ContactTypeAddressesArgs, MemberAddressType, Query } from "@/core/api/graphql/types";

export async function getMyAddresses(payload?: ContactTypeAddressesArgs): Promise<MemberAddressType[]> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "me">>, ContactTypeAddressesArgs>({
    query: GetMyAddressesDocument,
    variables: {
      ...payload,
    },
  });

  return data.me.contact?.addresses?.items ?? [];
}
