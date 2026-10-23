import { graphqlClient } from "@/core/api/graphql/client";
import { AddSavedPaymentMethodDocument } from "../../types";
import type { InputAddSavedPaymentMethod, AddSavedPaymentMethodMutation } from "../../types";

export async function addSavedPaymentMethod(
  command: InputAddSavedPaymentMethod,
): Promise<AddSavedPaymentMethodMutation["addSavedPaymentMethod"]> {
  const { data } = await graphqlClient.mutate({
    mutation: AddSavedPaymentMethodDocument,
    variables: { command },
  });

  return data!.addSavedPaymentMethod;
}
