import client from "@core/api/graphql/graphql-client";
import {
  InputPersonalDataType,
  IdentityResultType,
  Mutations,
  MutationsUpdatePersonalDataArgs,
} from "@core/api/graphql/types";
import mutationDocument from "./updatePersonalDataMutation.graphql";

export default async function updatePersonalData(personalData: InputPersonalDataType): Promise<IdentityResultType> {
  const { data } = await client.mutate<
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
