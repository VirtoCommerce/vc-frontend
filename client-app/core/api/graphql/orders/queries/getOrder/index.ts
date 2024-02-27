import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetFullOrderDocument } from "./getFullOrderQuery.generated";
import { GetShortOrderDocument } from "./getShortOrderQuery.generated";
import type { CustomerOrderType, Query, QueryOrderArgs } from "@/core/api/graphql/types";
import type { DocumentNode } from "graphql";

export type GetOrderPayloadType = Omit<QueryOrderArgs, "cultureName">;

export enum GetOrderFeldsType {
  Full,
  Short,
}

export type GetOrderOptionsType = {
  /** @default GetOrderFeldsType.Full */
  fields?: GetOrderFeldsType;
};

export async function getOrder(
  payload: GetOrderPayloadType,
  options: GetOrderOptionsType = {},
): Promise<CustomerOrderType> {
  const { fields = GetOrderFeldsType.Full } = options;
  const { cultureName } = globals;

  let query: DocumentNode;
  switch (fields) {
    case GetOrderFeldsType.Full:
      query = GetFullOrderDocument;
      break;
    case GetOrderFeldsType.Short:
      query = GetShortOrderDocument;
      break;
  }
  const { data } = await graphqlClient.query<Required<Pick<Query, "order">>, QueryOrderArgs>({
    query,
    variables: {
      cultureName,
      ...payload,
    },
  });

  return data.order;
}
