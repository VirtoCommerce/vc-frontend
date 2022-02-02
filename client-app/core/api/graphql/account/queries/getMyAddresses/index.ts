import client from "@core/api/graphql/graphql-client";
import { ContactTypeAddressesArgs, MemberAddressType, Query } from "@core/api/graphql/types";
import getMyAddressesQueryDocument from "./getMyAddressesQuery.graphql";

export default async function getMyAddresses(variables?: ContactTypeAddressesArgs): Promise<MemberAddressType[]> {
  const { data } = await client.query<Pick<Query, "me">, ContactTypeAddressesArgs>({
    query: getMyAddressesQueryDocument,
    variables,
  });

  return data.me?.contact?.addresses?.items ?? [];
}
