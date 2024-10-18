import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { DeleteFcmTokenDocument } from "../../types";

export function useDeleteFcmToken() {
  return useMutation(DeleteFcmTokenDocument);
}
