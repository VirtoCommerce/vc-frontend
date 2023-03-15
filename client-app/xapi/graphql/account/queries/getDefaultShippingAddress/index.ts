import getDefaultShippingAddressQueryDocument from "./getDefaultShippingAddressQuery.graphql";
import type { MemberAddressType, Query } from "@/xapi/types";

export default async function getDefaultShippingAddress(): Promise<MemberAddressType | undefined> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "me">>>({
    query: getDefaultShippingAddressQueryDocument,
  });

  return data.me.contact?.defaultShippingAddress;
}
