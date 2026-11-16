import { GetOrdersDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import type { ErrorNotificationsContextType } from "@/core/api/graphql/consts";
import type { QueryOrdersArgs } from "@/core/api/graphql/types";

export async function getOrders(payload?: QueryOrdersArgs, context?: ErrorNotificationsContextType) {
  const { userId, cultureName } = globals;

  const { data } = await graphqlClient.query({
    query: GetOrdersDocument,
    variables: {
      userId,
      cultureName,
      ...payload,
    },
    context,
  });

  return data.orders;
}
