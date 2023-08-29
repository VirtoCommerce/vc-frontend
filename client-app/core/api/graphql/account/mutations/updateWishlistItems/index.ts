import { graphqlClient } from "../../../client";
import mutationDocument from "./updateWishlistItemsMutation.graphql";
import type {
  InputUpdateWishlistItemsType,
  Mutations,
  MutationsUpdateWishListItemsArgs,
} from "@/core/api/graphql/types";

export async function updateWishlistItems(payload: InputUpdateWishlistItemsType): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "updateWishListItems">>, MutationsUpdateWishListItemsArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
