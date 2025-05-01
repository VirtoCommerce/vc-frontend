import { AddOrUpdateOrderPaymentDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type {
  InputAddOrUpdateOrderPaymentType,
  AddOrUpdateOrderPaymentMutation,
  AddOrUpdateOrderPaymentMutationVariables,
} from "@/core/api/graphql/types";

export async function addOrUpdateOrderPayment(payload: InputAddOrUpdateOrderPaymentType) {
  await graphqlClient.mutate<AddOrUpdateOrderPaymentMutation, AddOrUpdateOrderPaymentMutationVariables>({
    mutation: AddOrUpdateOrderPaymentDocument,
    variables: {
      command: payload,
    },
  });
}
