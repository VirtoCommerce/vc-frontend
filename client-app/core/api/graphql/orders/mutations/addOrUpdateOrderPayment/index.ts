import { graphqlClient } from "../../../client";
import { AddOrUpdateOrderPaymentDocument } from "./addOrUpdateOrderPaymentMutation.generated";
import type {
  InputAddOrUpdateOrderPaymentType,
  Mutations,
  MutationsAddOrUpdateOrderPaymentArgs,
} from "@/core/api/graphql/types";

export async function addOrUpdateOrderPayment(payload: InputAddOrUpdateOrderPaymentType): Promise<void> {
  await graphqlClient.mutate<
    Required<Pick<Mutations, "addOrUpdateOrderPayment">>,
    MutationsAddOrUpdateOrderPaymentArgs
  >({
    mutation: AddOrUpdateOrderPaymentDocument,
    variables: {
      command: payload,
    },
  });
}
