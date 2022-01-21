import client from "@core/api/graphql/graphql-client";
import { MemberAddressType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getMyAddressesQueryDocument from "./getMyAddressesQuery.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMyAddresses(sort: string): Promise<MemberAddressType[]> {
  const { data } = await client.query({
    query: getMyAddressesQueryDocument,
    variables: {
      command: {
        sort: sort,
      },
    },
  });
  console.log(data);
  return data?.me?.contact?.addresses.items;
}
export default getMyAddresses;
