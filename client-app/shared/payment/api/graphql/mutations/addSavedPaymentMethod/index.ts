import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { AddSavedPaymentMethodDocument } from "../../types";
import type { AddSavedPaymentMethodMutation, InputAddSavedPaymentMethod } from "../../types";

export async function addSavedPaymentMethod(
  command: InputAddSavedPaymentMethod,
): Promise<AddSavedPaymentMethodMutation["addSavedPaymentMethod"]> {
  const { data } = await graphqlClient.mutate({
    mutation: AddSavedPaymentMethodDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.addSavedPaymentMethod;
}
