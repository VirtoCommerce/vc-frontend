import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { AcceptSubscriptionTermsDocument } from "../../types";
import type { InputAcceptSubscriptionTerms, AcceptSubscriptionTermsMutation } from "../../types";

export async function acceptSubscriptionTerms(
  command: InputAcceptSubscriptionTerms,
): Promise<AcceptSubscriptionTermsMutation["acceptSubscriptionTerms"]> {
  const { data } = await graphqlClient.mutate({
    mutation: AcceptSubscriptionTermsDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.acceptSubscriptionTerms;
}
