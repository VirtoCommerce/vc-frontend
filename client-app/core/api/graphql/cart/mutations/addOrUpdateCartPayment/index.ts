import client from "@core/api/graphql/graphql-client";
import { InputPaymentType, Mutations, MutationsAddOrUpdateCartPaymentArgs } from "@core/api/graphql/types";
import mutationDocument from "./addOrUpdateCartPaymentMutation.graphql";
import globals from "@core/globals";

export default async function addOrUpdateCartPayment(payment: InputPaymentType): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "addOrUpdateCartPayment">>, MutationsAddOrUpdateCartPaymentArgs>({
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
  });
}
