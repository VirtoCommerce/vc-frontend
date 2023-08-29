import { graphqlClient } from "../../../client";
import getDefaultShippingAddressQueryDocument from "./getDefaultShippingAddressQuery.graphql";
import type { MemberAddressType, Query } from "@/core/api/graphql/types";

export async function getDefaultShippingAddress(): Promise<MemberAddressType | undefined> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "me">>>({
    query: getDefaultShippingAddressQueryDocument,
  });

  return data.me.contact?.defaultShippingAddress;
}
