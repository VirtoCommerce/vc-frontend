import { useMutation } from "@/core/api/graphql/composables/useMutation";
// import { DeleteFcmTokenDocument } from "@/core/api/graphql/types";
import DeleteFcmToken from "@/core/api/graphql/push-messages/mutations/deleteFcmToken/deleteFcmToken.graphql";

export function useDeleteFcmToken() {
  // return useMutation(DeleteFcmTokenDocument);
  return useMutation(DeleteFcmToken);
}
