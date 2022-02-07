import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./changeCartCommentMutation.graphql";

export default async function changeCartComment(comment: string): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId: storeId,
        userId: currentUserId,
        comment: comment,
      },
    },
  });
}
