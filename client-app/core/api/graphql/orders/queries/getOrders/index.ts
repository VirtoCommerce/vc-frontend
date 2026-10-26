import { GetOrdersDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import type { QueryOrdersArgs } from "@/core/api/graphql/types";
import type { DefaultContext } from "@apollo/client/core";

// `context` lets a caller that shows its own failure, such as SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT, keep the
// app-wide error notification quiet.
export async function getOrders(payload?: QueryOrdersArgs, context?: DefaultContext) {
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
