import { graphqlClient } from "@/core/api/graphql/client";
import { SetDefaultSavedPaymentMethodDocument } from "../../types";
import type { InputSavedPaymentMethodId, SetDefaultSavedPaymentMethodMutation } from "../../types";

export async function setDefaultSavedPaymentMethod(
  command: InputSavedPaymentMethodId,
): Promise<SetDefaultSavedPaymentMethodMutation["setDefaultSavedPaymentMethod"]> {
  const { data } = await graphqlClient.mutate({
    mutation: SetDefaultSavedPaymentMethodDocument,
    variables: { command },
  });

  return data!.setDefaultSavedPaymentMethod;
}
