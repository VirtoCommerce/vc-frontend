import { graphqlClient } from "../../../client";
import mutationDocument from "./updatePersonalDataMutation.graphql";
import type {
  InputPersonalDataType,
  IdentityResultType,
  Mutations,
  MutationsUpdatePersonalDataArgs,
} from "@/core/api/graphql/types";

export async function updatePersonalData(personalData: InputPersonalDataType): Promise<IdentityResultType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "updatePersonalData">>,
    MutationsUpdatePersonalDataArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        personalData,
      },
    },
  });

  return data!.updatePersonalData;
}
