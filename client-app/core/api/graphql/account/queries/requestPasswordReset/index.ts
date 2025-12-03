import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import requestPasswordResetDocument from "./requestPasswordReset.graphql";
import type { Query, QueryRequestPasswordResetArgs } from "@/core/api/graphql/types";

/**
 * @deprecated Use sendPasswordResetEmail mutation instead
 */
export async function requestPasswordReset(payload: QueryRequestPasswordResetArgs): Promise<boolean> {
  const { storeId, cultureName } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "requestPasswordReset">>,
    QueryRequestPasswordResetArgs
  >({
    query: requestPasswordResetDocument,
    variables: {
      storeId,
      cultureName,
      ...payload,
    },
  });

  return data.requestPasswordReset;
}
