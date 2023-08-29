import { graphqlClient } from "../../../client";
import requestPasswordResetDocument from "./requestPasswordReset.graphql";
import type { Query, QueryRequestPasswordResetArgs } from "@/core/api/graphql/types";

export async function requestPasswordReset(payload: QueryRequestPasswordResetArgs): Promise<boolean> {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "requestPasswordReset">>,
    QueryRequestPasswordResetArgs
  >({
    query: requestPasswordResetDocument,
    variables: {
      ...payload,
    },
  });

  return data.requestPasswordReset;
}
