import { graphqlClient } from "../../../client";
import mutationDocument from "./deactivateBackInStockSubscription.graphql";
import type {
  DeactivateBackInStockSubscriptionCommandType,
  Mutations,
  MutationsDeactivateBackInStockSubscriptionArgs,
  BackInStockSubscriptionType,
} from "@/core/api/graphql/types";

export async function deactivateBackInStockSubscription(
  payload: DeactivateBackInStockSubscriptionCommandType,
): Promise<Promise<BackInStockSubscriptionType | undefined>> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "deactivateBackInStockSubscription">>,
    MutationsDeactivateBackInStockSubscriptionArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data?.deactivateBackInStockSubscription;
}
