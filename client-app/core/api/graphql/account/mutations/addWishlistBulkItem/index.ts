import { graphqlClient } from "../../../client";
import mutationDocument from "./addWishlistBulkItem.graphql";
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
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.addWishlistBulkItem;
}
