import mutationDocument from "./addBulkItemsToCartMutation.graphql";
import { BulkCartType, Mutations, MutationsAddBulkItemsCartArgs } from "@/xapi/graphql/types";
import { InputBulkItemsType } from "@/xapi/graphql/cart";
import globals from "@core/globals";

export default async function addBulkItemsToCart(payload: InputBulkItemsType): Promise<BulkCartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "addBulkItemsCart">>, MutationsAddBulkItemsCartArgs>({
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
