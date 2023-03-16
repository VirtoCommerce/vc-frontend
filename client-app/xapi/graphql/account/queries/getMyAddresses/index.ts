import getMyAddressesQueryDocument from "./getMyAddressesQuery.graphql";
import type { ContactTypeAddressesArgs, MemberAddressType, Query } from "@/xapi/types";

export default async function getMyAddresses(payload?: ContactTypeAddressesArgs): Promise<MemberAddressType[]> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "me">>, ContactTypeAddressesArgs>({
    query: getMyAddressesQueryDocument,
    variables: {
      ...payload,
    },
  });

  return data.me.contact?.addresses?.items ?? [];
}
