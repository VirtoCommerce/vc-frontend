import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { SetDefaultSavedPaymentMethodDocument } from "@/core/api/graphql/types";
import type { InputSavedPaymentMethodId, SetDefaultSavedPaymentMethodMutation } from "@/core/api/graphql/types";

export async function setDefaultSavedPaymentMethod(
  command: InputSavedPaymentMethodId,
): Promise<SetDefaultSavedPaymentMethodMutation["setDefaultSavedPaymentMethod"]> {
  const { data } = await graphqlClient.mutate({
    mutation: SetDefaultSavedPaymentMethodDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.setDefaultSavedPaymentMethod;
}
