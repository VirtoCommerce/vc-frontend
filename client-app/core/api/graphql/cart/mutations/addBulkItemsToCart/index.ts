import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addBulkItemsToCartMutation.graphql";
import { BulkCartType, Mutations, MutationsAddBulkItemsCartArgs } from "@core/api/graphql/types";
import { InputBulkItemsType } from "@core/api/graphql/cart";

export default async function addBulkItemsToCart(payload: InputBulkItemsType): Promise<BulkCartType> {
  const { data } = await client.mutate<Required<Pick<Mutations, "addBulkItemsCart">>, MutationsAddBulkItemsCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
        ...payload,
      },
    },
  });

  return data!.addBulkItemsCart;
}
