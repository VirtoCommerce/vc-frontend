import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageReadDocument } from "@/core/api/graphql/types";

export function useMarkPushMessageRead() {
  return useMutation(MarkPushMessageReadDocument);
}
