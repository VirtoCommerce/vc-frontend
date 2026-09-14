import { useMutation } from "@vue/apollo-composable";
import { UpdateReturnDocument } from "@/modules/returns/api/graphql/types";

export function useUpdateReturnMutation() {
  return useMutation(UpdateReturnDocument);
}
