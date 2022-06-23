import { InputPaymentType, Mutations, MutationsAddOrUpdateCartPaymentArgs } from "@/xapi/types";
import mutationDocument from "./addOrUpdateCartPaymentMutation.graphql";
import globals from "@/core/globals";

export default async function addOrUpdateCartPayment(payment: InputPaymentType): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "addOrUpdateCartPayment">>, MutationsAddOrUpdateCartPaymentArgs>(
    {
      mutation: mutationDocument,
      variables: {
        command: {
          storeId,
          userId,
          cultureName,
          currencyCode,
          payment,
        },
      },
    }
  );
}
