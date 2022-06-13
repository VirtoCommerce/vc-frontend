import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./addBulkItemsToCartMutation.graphql";
import { BulkCartType, Mutations, MutationsAddBulkItemsCartArgs } from "@core/api/graphql/types";
import { InputBulkItemsType } from "@core/api/graphql/cart";
import globals from "@core/globals";

export default async function addBulkItemsToCart(payload: InputBulkItemsType): Promise<BulkCartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await client.mutate<Required<Pick<Mutations, "addBulkItemsCart">>, MutationsAddBulkItemsCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        ...payload,
      },
    },
  });

  return data!.addBulkItemsCart;
}
