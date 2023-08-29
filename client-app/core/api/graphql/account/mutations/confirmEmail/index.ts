import { graphqlClient } from "../../../client";
import mutationDocument from "./confirmEmail.graphql";
import type {
  CustomIdentityResultType,
  InputConfirmEmailType,
  Mutations,
  MutationsConfirmEmailArgs,
} from "@/core/api/graphql/types";

export async function confirmEmailByToken(payload: InputConfirmEmailType): Promise<CustomIdentityResultType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "confirmEmail">>, MutationsConfirmEmailArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.confirmEmail;
}
