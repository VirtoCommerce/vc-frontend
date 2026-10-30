import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { RequestMfaChangeCodeDocument } from "../../types";
import type { RequestMfaChangeCodeMutation, RequestMfaChangeCodeMutationVariables } from "../../types";

export async function requestMfaChangeCode(): Promise<RequestMfaChangeCodeMutation["requestMfaChangeCode"]> {
  const { storeId } = globals;

  const { data } = await graphqlClient.mutate<RequestMfaChangeCodeMutation, RequestMfaChangeCodeMutationVariables>({
    mutation: RequestMfaChangeCodeDocument,
    variables: { command: { storeId } },
  });

  return data?.requestMfaChangeCode;
}
