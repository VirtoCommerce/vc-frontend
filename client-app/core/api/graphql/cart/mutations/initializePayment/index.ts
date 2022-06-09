import client from "@core/api/graphql/graphql-client";
import {
  InitializePaymentResultType,
  InputInitializePaymentType,
  Mutations,
  MutationsInitializePaymentArgs,
} from "@core/api/graphql/types";
import mutationDocument from "./initializePaymentMutation.graphql";

export default async function initializePayment(
  payload: InputInitializePaymentType
): Promise<InitializePaymentResultType> {
  const { data } = await client.mutate<Required<Pick<Mutations, "initializePayment">>, MutationsInitializePaymentArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.initializePayment;
}
