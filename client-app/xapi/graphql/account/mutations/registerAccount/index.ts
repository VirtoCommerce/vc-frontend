import {
  InputRequestRegistrationType,
  RequestRegistrationType,
  Mutations,
  MutationsRequestRegistrationArgs,
} from "@/xapi/types";
import mutationDocument from "./requestRegistration.graphql";

export default async function registerAccount(
  registrationData: InputRequestRegistrationType
): Promise<RequestRegistrationType> {
  const { $graphqlClient } = useNuxtApp();
  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "requestRegistration">>,
    MutationsRequestRegistrationArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: registrationData,
    },
  });

  return data!.requestRegistration;
}
