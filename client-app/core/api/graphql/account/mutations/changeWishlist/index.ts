import { graphqlClient } from "../../../client";
import { ChangeWishlistDocument } from "./changeWishlistMutation.generated";
import type { Mutations, MutationsChangeWishlistArgs, WishlistType } from "@/core/api/graphql/types";
import type { ChangeWishlistPayloadType } from "@/core/types";

export async function changeWishlist(payload: ChangeWishlistPayloadType): Promise<WishlistType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "changeWishlist">>, MutationsChangeWishlistArgs>(
    {
      mutation: ChangeWishlistDocument,
      variables: {
        command: {
          ...payload,
        },
      },
    },
  );

  return data!.changeWishlist;
}
