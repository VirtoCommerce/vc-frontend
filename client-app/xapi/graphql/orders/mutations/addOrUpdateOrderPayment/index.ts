import {
  InputAddOrUpdateOrderPaymentType,
  Mutations,
  MutationsAddOrUpdateOrderPaymentArgs,
} from "@/xapi/graphql/types";
import mutationDocument from "./addOrUpdateOrderPaymentMutation.graphql";

export default async function addOrUpdateOrderPayment(payload: InputAddOrUpdateOrderPaymentType): Promise<void> {
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<
    Required<Pick<Mutations, "addOrUpdateOrderPayment">>,
    MutationsAddOrUpdateOrderPaymentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
