import { graphqlClient } from "../../../client";
import mutationDocument from "./initializePaymentMutation.graphql";
import type {
  InitializePaymentResultType,
  InputInitializePaymentType,
  Mutations,
  MutationsInitializePaymentArgs,
} from "@/core/api/graphql/types";

export async function initializePayment(payload: InputInitializePaymentType): Promise<InitializePaymentResultType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "initializePayment">>,
    MutationsInitializePaymentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.initializePayment;
}
