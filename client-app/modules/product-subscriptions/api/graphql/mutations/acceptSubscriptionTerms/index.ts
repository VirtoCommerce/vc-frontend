import { graphqlClient } from "@/core/api/graphql/client";
import { AcceptSubscriptionTermsDocument } from "../../types";
import type { InputAcceptSubscriptionTerms, AcceptSubscriptionTermsMutation } from "../../types";

export async function acceptSubscriptionTerms(
  command: InputAcceptSubscriptionTerms,
): Promise<AcceptSubscriptionTermsMutation["acceptSubscriptionTerms"]> {
  const { data } = await graphqlClient.mutate({
    mutation: AcceptSubscriptionTermsDocument,
    variables: { command },
  });

  return data!.acceptSubscriptionTerms;
}
