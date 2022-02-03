import client from "@core/api/graphql/graphql-client";
import { MemberAddressType } from "@core/api/graphql/types";
import getDefaultShippingAddressQueryDocument from "./getDefaultShippingAddressQuery.graphql";

export default async function getDefaultShippingAddress(): Promise<MemberAddressType> {
  const { data } = await client.query({
    query: getDefaultShippingAddressQueryDocument,
  });
  return data?.me?.contact?.defaultShippingAddress;
}
