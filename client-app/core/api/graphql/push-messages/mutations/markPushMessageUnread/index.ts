import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { MarkPushMessageReadDocument } from "@/core/api/graphql/types";

export function useMarkPushMessageUnread() {
  return useMutation(MarkPushMessageReadDocument);
}
