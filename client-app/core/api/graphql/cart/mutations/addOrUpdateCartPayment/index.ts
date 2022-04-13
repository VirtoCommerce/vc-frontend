import client from "@core/api/graphql/graphql-client";
import { InputPaymentType, Mutations, MutationsAddOrUpdateCartPaymentArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addOrUpdateCartPaymentMutation.graphql";

export default async function addOrUpdateCartPayment(payment: InputPaymentType): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "addOrUpdateCartPayment">>, MutationsAddOrUpdateCartPaymentArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        payment,
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });
}
