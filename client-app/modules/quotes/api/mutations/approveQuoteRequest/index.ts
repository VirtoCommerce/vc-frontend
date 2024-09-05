import { graphqlClient } from "@/core/api/graphql/client";
import mutationDocument from "./approveQuoteRequestMutation.graphql";
import type { Mutations, MutationsApproveQuoteRequestArgs, ApproveQuoteResultType } from "../../types";

export async function approveQuoteRequest(payload: MutationsApproveQuoteRequestArgs): Promise<ApproveQuoteResultType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "approveQuoteRequest">>,
    MutationsApproveQuoteRequestArgs
  >({
    mutation: mutationDocument,
    variables: {
      ...payload,
    },
  });

  return data!.approveQuoteRequest;
}
