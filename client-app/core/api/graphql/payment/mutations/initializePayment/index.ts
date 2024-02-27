import { graphqlClient } from "../../../client";
import { InitializePaymentDocument } from "./initializePaymentMutation.generated";
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
    mutation: InitializePaymentDocument,
    variables: {
      command: payload,
    },
  });

  return data!.initializePayment;
}
