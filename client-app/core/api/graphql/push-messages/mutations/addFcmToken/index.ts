import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { AddFcmTokenDocument } from "@/core/api/graphql/types";

export function useAddFcmToken() {
  return useMutation(AddFcmTokenDocument);
}
