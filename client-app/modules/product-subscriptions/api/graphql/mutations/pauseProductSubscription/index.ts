import { graphqlClient } from "@/core/api/graphql/client";
import { PauseProductSubscriptionDocument } from "../../types";
import type { InputPauseProductSubscription, PauseProductSubscriptionMutation } from "../../types";

export async function pauseProductSubscription(
  command: InputPauseProductSubscription,
): Promise<PauseProductSubscriptionMutation["pauseProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: PauseProductSubscriptionDocument,
    variables: { command },
  });

  return data!.pauseProductSubscription;
}
