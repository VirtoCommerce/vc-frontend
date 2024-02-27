import { graphqlClient } from "../../../client";
import { ConfirmEmailDocument } from "./confirmEmail.generated";
import type {
  CustomIdentityResultType,
  InputConfirmEmailType,
  Mutations,
  MutationsConfirmEmailArgs,
} from "@/core/api/graphql/types";

export async function confirmEmailByToken(payload: InputConfirmEmailType): Promise<CustomIdentityResultType> {
  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "confirmEmail">>, MutationsConfirmEmailArgs>({
    mutation: ConfirmEmailDocument,
    variables: {
      command: payload,
    },
  });

  return data!.confirmEmail;
}
