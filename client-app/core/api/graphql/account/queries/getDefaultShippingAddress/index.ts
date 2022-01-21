import client from "@core/api/graphql/graphql-client";
import { MemberAddressType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getDefaultShippingAddressesQueryDocument from "./getDefaultShippingAddressesQuery.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getDefaultShippingAddresses(): Promise<MemberAddressType> {
  const { data } = await client.query({
    query: getDefaultShippingAddressesQueryDocument,
  });
  return data?.me?.contact?.defaultShippingAddress;
}
export default getDefaultShippingAddresses;
