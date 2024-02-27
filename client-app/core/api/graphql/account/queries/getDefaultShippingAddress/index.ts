import { graphqlClient } from "../../../client";
import { GetDefaultShippingAddressDocument } from "./getDefaultShippingAddressQuery.generated";
import type { MemberAddressType, Query } from "@/core/api/graphql/types";

export async function getDefaultShippingAddress(): Promise<MemberAddressType | undefined> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "me">>>({
    query: GetDefaultShippingAddressDocument,
  });

  return data.me.contact?.defaultShippingAddress;
}
