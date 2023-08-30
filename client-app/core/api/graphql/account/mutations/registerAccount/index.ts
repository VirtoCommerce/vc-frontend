import { graphqlClient } from "../../../client";
import mutationDocument from "./requestRegistration.graphql";
import type {
  InputRequestRegistrationType,
  RequestRegistrationType,
  Mutations,
  MutationsRequestRegistrationArgs,
} from "@/core/api/graphql/types";

export async function registerAccount(
  registrationData: InputRequestRegistrationType,
): Promise<RequestRegistrationType> {
  const { data } = await graphqlClient.mutate<
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
