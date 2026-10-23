import { graphqlClient } from "@/core/api/graphql/client";
import { SkipSubscriptionRenewalDocument } from "../../types";
import type { InputSubscriptionRenewalId, SkipSubscriptionRenewalMutation } from "../../types";

export async function skipSubscriptionRenewal(
  command: InputSubscriptionRenewalId,
): Promise<SkipSubscriptionRenewalMutation["skipSubscriptionRenewal"]> {
  const { data } = await graphqlClient.mutate({
    mutation: SkipSubscriptionRenewalDocument,
    variables: { command },
  });

  return data!.skipSubscriptionRenewal;
}
