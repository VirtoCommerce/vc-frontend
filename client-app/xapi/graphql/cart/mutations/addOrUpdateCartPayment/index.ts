import globals from "@/core/globals";
import mutationDocument from "./addOrUpdateCartPaymentMutation.graphql";
import type { CartType, InputPaymentType, Mutations, MutationsAddOrUpdateCartPaymentArgs } from "@/xapi/types";

export async function addOrUpdateCartPayment(payment: InputPaymentType, cartId?: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "addOrUpdateCartPayment">>,
    MutationsAddOrUpdateCartPaymentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        cartId,
        payment,
      },
    },
  });

  return data!.addOrUpdateCartPayment;
}
