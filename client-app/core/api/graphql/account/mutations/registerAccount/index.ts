import client from "@core/api/graphql/graphql-client";
import {
  InputRequestRegistrationType,
  RequestRegistrationType,
  Mutations,
  MutationsRequestRegistrationArgs,
} from "@core/api/graphql/types";
import mutationDocument from "./requestRegistration.graphql";

export default async function registerAccount(
  registrationData: InputRequestRegistrationType
): Promise<RequestRegistrationType> {
  const { data } = await client.mutate<
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
