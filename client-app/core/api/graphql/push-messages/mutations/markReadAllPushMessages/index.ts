import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkReadAllPushMessagesDocument } from "@/core/api/graphql/types";

export function useMarkReadAllPushMessages() {
  return useMutation(MarkReadAllPushMessagesDocument);
}
