import { graphqlClient } from "@/core/api/graphql/client";
import { DeactivateBackInStockSubscriptionDocument } from "../../types";
import type {
  DeactivateBackInStockSubscriptionCommandType,
  Mutations,
  MutationsDeactivateBackInStockSubscriptionArgs,
  BackInStockSubscriptionType,
} from "../../types";

export async function deactivateBackInStockSubscription(
  payload: DeactivateBackInStockSubscriptionCommandType,
): Promise<BackInStockSubscriptionType | undefined> {
  const {data} = await graphqlClient.mutate<
    Required<Pick<Mutations, "deactivateBackInStockSubscription">>,
    MutationsDeactivateBackInStockSubscriptionArgs
  >({
    mutation: DeactivateBackInStockSubscriptionDocument,
    variables: {
      command: payload,
    },
  });

  return data?.deactivateBackInStockSubscription;
}
