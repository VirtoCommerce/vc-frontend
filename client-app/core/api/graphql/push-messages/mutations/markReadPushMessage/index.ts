import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkReadPushMessageDocument } from "@/core/api/graphql/types";

export function useMarkReadPushMessage() {
  return useMutation(MarkReadPushMessageDocument);
}
