import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./addWishlistMutation.graphql";
import { Mutations, MutationsCreateWishlistArgs, WishlistType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";

export default async function addWishlist(listName?: string): Promise<WishlistType> {
  const { data } = await client.mutate<Required<Pick<Mutations, "createWishlist">>, MutationsCreateWishlistArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
        listName,
      },
    },
  });

  return data!.createWishlist;
}
