import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { DeleteFcmTokenDocument } from "@/core/api/graphql/types";

export function useDeleteFcmToken() {
  return useMutation(DeleteFcmTokenDocument);
}
