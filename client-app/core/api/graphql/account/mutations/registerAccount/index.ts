import { graphqlClient } from "../../../client";
import { RequestRegistrationDocument } from "./requestRegistration.generated";
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
    mutation: RequestRegistrationDocument,
    variables: {
      command: registrationData,
    },
  });

  return data!.requestRegistration;
}
