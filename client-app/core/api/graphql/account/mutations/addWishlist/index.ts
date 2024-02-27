import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { AddWishlistDocument } from "./addWishlistMutation.generated";
import type { Mutations, MutationsCreateWishlistArgs, WishlistType } from "@/core/api/graphql/types";
import type { CreateWishlistPayloadType } from "@/core/types";

export async function addWishlist(payload: CreateWishlistPayloadType): Promise<WishlistType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "createWishlist">>, MutationsCreateWishlistArgs>(
    {
      mutation: AddWishlistDocument,
      variables: {
        command: {
          storeId,
          userId,
          cultureName,
          currencyCode,
          ...payload,
        },
      },
    },
  );

  return data!.createWishlist;
}
