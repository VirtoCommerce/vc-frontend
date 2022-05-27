import client from "@core/api/graphql/graphql-client";
import { MemberAddressType, Query } from "@core/api/graphql/types";
import getDefaultShippingAddressQueryDocument from "./getDefaultShippingAddressQuery.graphql";

export default async function getDefaultShippingAddress(): Promise<MemberAddressType | undefined> {
  const { data } = await client.query<Required<Pick<Query, "me">>>({
    query: getDefaultShippingAddressQueryDocument,
  });

  return data.me.contact?.defaultShippingAddress;
}
