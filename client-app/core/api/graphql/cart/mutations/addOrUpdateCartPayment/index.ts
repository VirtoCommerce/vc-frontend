import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./addOrUpdateCartPaymentMutation.graphql";
import type {
  CartType,
  InputPaymentType,
  Mutations,
  MutationsAddOrUpdateCartPaymentArgs,
} from "@/core/api/graphql/types";

export async function addOrUpdateCartPayment(payment: InputPaymentType, cartId?: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<
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
