import { graphqlClient } from "@/core/api/graphql/client";
import { SkipProductSubscriptionDocument } from "../../types";
import type { InputProductSubscriptionId, SkipProductSubscriptionMutation } from "../../types";

export async function skipProductSubscription(
  command: InputProductSubscriptionId,
): Promise<SkipProductSubscriptionMutation["skipProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: SkipProductSubscriptionDocument,
    variables: { command },
  });

  return data!.skipProductSubscription;
}
