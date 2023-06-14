import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./addBulkItemsCartMutation.graphql";
import type {
  BulkCartType,
  InputNewBulkItemType,
  Mutations,
  MutationsAddBulkItemsCartArgs,
} from "@/core/api/graphql/types";

export async function addBulkItemsCart(items: InputNewBulkItemType[]): Promise<Required<BulkCartType>> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "addBulkItemsCart">>,
    MutationsAddBulkItemsCartArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        cartItems: items,
      },
    },
  });

  return <Required<BulkCartType>>data!.addBulkItemsCart;
}
