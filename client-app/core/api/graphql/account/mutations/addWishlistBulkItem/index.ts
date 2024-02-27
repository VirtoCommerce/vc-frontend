import { graphqlClient } from "../../../client";
import { AddWishlistBulkItemDocument } from "./addWishlistBulkItem.generated";
import type {
  Mutations,
  MutationsAddWishlistBulkItemArgs,
  BulkWishlistType,
  InputAddWishlistBulkItemType,
} from "@/core/api/graphql/types";

export async function addWishlistBulkItem(payload: InputAddWishlistBulkItemType): Promise<BulkWishlistType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "addWishlistBulkItem">>,
    MutationsAddWishlistBulkItemArgs
  >({
    mutation: AddWishlistBulkItemDocument,
    variables: {
      command: payload,
    },
  });

  return data!.addWishlistBulkItem;
}
