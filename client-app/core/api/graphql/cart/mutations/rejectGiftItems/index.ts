import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./rejectGiftItemsMutation.graphql";

export default async function rejectGiftItems(giftIds: string[]): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        ids: giftIds,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
