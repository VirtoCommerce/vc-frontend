import client from "@core/api/graphql/graphql-client";
import { MemberAddressType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getDefaultShippingAddressQueryDocument from "./getDefaultShippingAddressQuery.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getDefaultShippingAddress(): Promise<MemberAddressType> {
  const { data } = await client.query({
    query: getDefaultShippingAddressQueryDocument,
  });
  return data?.me?.contact?.defaultShippingAddress;
}
export default getDefaultShippingAddress;
