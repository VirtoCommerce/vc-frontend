import { graphqlClient } from "@/core/api/graphql/client";
import updateQuoteAttachmentsDocument from "./updateQuoteAttachments.graphql";
import type { UpdateQuoteAttachmentsMutation, UpdateQuoteAttachmentsMutationVariables } from "@/core/api/graphql/types";

export async function updateQuoteAttachments(
  quoteId: string,
  urls: string[],
): Promise<UpdateQuoteAttachmentsMutation["updateQuoteAttachments"]> {
  const { data } = await graphqlClient.mutate<UpdateQuoteAttachmentsMutation, UpdateQuoteAttachmentsMutationVariables>({
    mutation: updateQuoteAttachmentsDocument,
    variables: {
      command: {
        quoteId,
        urls,
      },
    },
  });

  return data?.updateQuoteAttachments;
}
