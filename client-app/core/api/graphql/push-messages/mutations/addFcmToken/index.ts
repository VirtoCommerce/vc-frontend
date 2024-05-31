import { useMutation } from "@/core/api/graphql/composables/useMutation";
// import { AddFcmTokenDocument } from "@/core/api/graphql/types";
import AddFcmToken from "@/core/api/graphql/push-messages/mutations/addFcmToken/addFcmToken.graphql";

export function useAddFcmToken() {
  // return useMutation(AddFcmTokenDocument);
  return useMutation(AddFcmToken);
}
