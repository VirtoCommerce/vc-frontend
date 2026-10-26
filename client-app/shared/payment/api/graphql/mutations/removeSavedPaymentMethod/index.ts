import { graphqlClient } from "@/core/api/graphql/client";
import { RemoveSavedPaymentMethodDocument } from "../../types";
import type { InputSavedPaymentMethodId, RemoveSavedPaymentMethodMutation } from "../../types";

export async function removeSavedPaymentMethod(
  command: InputSavedPaymentMethodId,
): Promise<RemoveSavedPaymentMethodMutation["removeSavedPaymentMethod"]> {
  const { data } = await graphqlClient.mutate({
    mutation: RemoveSavedPaymentMethodDocument,
    variables: { command },
  });

  return data!.removeSavedPaymentMethod;
}
