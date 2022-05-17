import client from "@core/api/graphql/graphql-client";
import { ContactTypeAddressesArgs, MemberAddressType, Query } from "@core/api/graphql/types";
import getMyAddressesQueryDocument from "./getMyAddressesQuery.graphql";

export default async function getMyAddresses(payload?: ContactTypeAddressesArgs): Promise<MemberAddressType[]> {
  const { data } = await client.query<Required<Pick<Query, "me">>, ContactTypeAddressesArgs>({
    query: getMyAddressesQueryDocument,
    variables: {
      ...payload,
    },
  });

  return data.me.contact?.addresses?.items ?? [];
}
