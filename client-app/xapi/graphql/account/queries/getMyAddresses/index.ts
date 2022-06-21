import { ContactTypeAddressesArgs, MemberAddressType, Query } from "@/xapi/graphql/types";
import getMyAddressesQueryDocument from "./getMyAddressesQuery.graphql";

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
