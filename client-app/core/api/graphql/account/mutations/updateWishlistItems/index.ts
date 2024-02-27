import { graphqlClient } from "../../../client";
import { UpdateWishListItemsDocument } from "./updateWishlistItemsMutation.generated";
import type {
  InputUpdateWishlistItemsType,
  Mutations,
  MutationsUpdateWishListItemsArgs,
} from "@/core/api/graphql/types";

export async function updateWishlistItems(payload: InputUpdateWishlistItemsType): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "updateWishListItems">>, MutationsUpdateWishListItemsArgs>({
    mutation: UpdateWishListItemsDocument,
    variables: {
      command: payload,
    },
  });
}
