import { graphqlClient } from "@/core/api/graphql/client";
import { UpdateQuoteAttachmentsDocument } from "./updateQuoteAttachments.generated";
import type {
  UpdateQuoteAttachmentsMutation,
  UpdateQuoteAttachmentsMutationVariables,
} from "./updateQuoteAttachments.generated";

export async function updateQuoteAttachments(
  quoteId: string,
  urls: string[],
): Promise<UpdateQuoteAttachmentsMutation["updateQuoteAttachments"]> {
  const { data } = await graphqlClient.mutate<UpdateQuoteAttachmentsMutation, UpdateQuoteAttachmentsMutationVariables>({
    mutation: UpdateQuoteAttachmentsDocument,
    variables: {
      command: {
        quoteId,
        urls,
      },
    },
  });

  return data?.updateQuoteAttachments;
}
