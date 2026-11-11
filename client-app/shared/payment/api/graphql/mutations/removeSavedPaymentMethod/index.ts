import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { RemoveSavedPaymentMethodDocument } from "../../types";
import type { InputSavedPaymentMethodId, RemoveSavedPaymentMethodMutation } from "../../types";

export async function removeSavedPaymentMethod(
  command: InputSavedPaymentMethodId,
): Promise<RemoveSavedPaymentMethodMutation["removeSavedPaymentMethod"]> {
  const { data } = await graphqlClient.mutate({
    mutation: RemoveSavedPaymentMethodDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.removeSavedPaymentMethod;
}
