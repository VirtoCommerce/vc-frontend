import { graphqlClient } from "../../../client";
import mutationDocument from "./addOrUpdateOrderPaymentMutation.graphql";
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
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
