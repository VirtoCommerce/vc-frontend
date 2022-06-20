import { MemberAddressType, Query } from "@/xapi/types";
import getDefaultShippingAddressQueryDocument from "./getDefaultShippingAddressQuery.graphql";

export default async function getDefaultShippingAddress(): Promise<MemberAddressType | undefined> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "me">>>({
    query: getDefaultShippingAddressQueryDocument,
  });

  return data.me.contact?.defaultShippingAddress;
}
