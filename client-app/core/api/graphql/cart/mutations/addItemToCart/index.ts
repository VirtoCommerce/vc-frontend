import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addItemToCartMutation.graphql";
import { Mutations, MutationsAddItemArgs } from "@core/api/graphql/types";

export default async function addItemToCart(productId: string, quantity: number): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "addItem">>, MutationsAddItemArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
        productId,
        quantity,
      },
    },
  });
}
