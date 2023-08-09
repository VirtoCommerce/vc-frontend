import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getFullCartQuery from "./getFullCartQuery.graphql";
import getShortCartQuery from "./getShortCartQuery.graphql";
import type { CartType, Query, QueryCartArgs } from "@/core/api/graphql/types";
import type { DocumentNode } from "graphql";

export enum GetCartFeldsType {
  Full,
  Short,
}

export type GetCartOptionsType = {
  /** @default GetCartFeldsType.Full */
  fields?: GetCartFeldsType;
};

export async function getCart(options: GetCartOptionsType = {}): Promise<CartType> {
  const { fields = GetCartFeldsType.Full } = options;
  const { storeId, userId, cultureName, currencyCode } = globals;

  let query: DocumentNode;
  switch (fields) {
    case GetCartFeldsType.Full:
      query = getFullCartQuery;
      break;
    case GetCartFeldsType.Short:
      query = getShortCartQuery;
      break;
  }
  const { data } = await graphqlClient.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
    query,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
    },
  });

  return data.cart;
}
