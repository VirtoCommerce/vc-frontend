import { AddOrUpdateOrderPaymentDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { InputAddOrUpdateOrderPaymentType } from "@/core/api/graphql/types";

export async function addOrUpdateOrderPayment(payload: InputAddOrUpdateOrderPaymentType) {
  await graphqlClient.mutate({
    mutation: AddOrUpdateOrderPaymentDocument,
    variables: {
      command: payload,
    },
  });
}
