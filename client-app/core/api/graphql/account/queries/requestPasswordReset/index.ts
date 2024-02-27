import { graphqlClient } from "../../../client";
import { RequestPasswordResetDocument } from "./requestPasswordReset.generated";
import type { Query, QueryRequestPasswordResetArgs } from "@/core/api/graphql/types/base.generated";

export async function requestPasswordReset(payload: QueryRequestPasswordResetArgs): Promise<boolean> {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "requestPasswordReset">>,
    QueryRequestPasswordResetArgs
  >({
    query: RequestPasswordResetDocument,
    variables: {
      ...payload,
    },
  });

  return data.requestPasswordReset;
}
