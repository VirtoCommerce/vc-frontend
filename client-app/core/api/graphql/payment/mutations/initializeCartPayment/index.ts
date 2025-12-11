import { graphqlClient } from "../../../client";
import mutationDocument from "./initializeCartPaymentMutation.graphql";
import type {
  InitializeCartPaymentResultType,
  InputInitializeCartPaymentType,
  Mutations,
  MutationsInitializeCartPaymentArgs,
} from "@/core/api/graphql/types";

export async function initializeCartPayment(
  payload: InputInitializeCartPaymentType,
): Promise<InitializeCartPaymentResultType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "initializeCartPayment">>,
    MutationsInitializeCartPaymentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.initializeCartPayment;
}
