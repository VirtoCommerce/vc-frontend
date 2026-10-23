import { graphqlClient } from "@/core/api/graphql/client";
import { AcceptSubscriptionRenewalDocument } from "../../types";
import type { InputSubscriptionRenewalId, AcceptSubscriptionRenewalMutation } from "../../types";

export async function acceptSubscriptionRenewal(
  command: InputSubscriptionRenewalId,
): Promise<AcceptSubscriptionRenewalMutation["acceptSubscriptionRenewal"]> {
  const { data } = await graphqlClient.mutate({
    mutation: AcceptSubscriptionRenewalDocument,
    variables: { command },
  });

  return data!.acceptSubscriptionRenewal;
}
