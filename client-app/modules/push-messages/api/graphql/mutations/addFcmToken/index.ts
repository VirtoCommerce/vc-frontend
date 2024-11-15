import { useMutation } from "@/core/api/graphql/composables/useMutation";
import { AddFcmTokenDocument } from "../../types";

export function useAddFcmToken() {
  return useMutation(AddFcmTokenDocument);
}
