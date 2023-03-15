import mutationDocument from "./updatePersonalDataMutation.graphql";
import type {
  InputPersonalDataType,
  IdentityResultType,
  Mutations,
  MutationsUpdatePersonalDataArgs,
} from "@/xapi/types";

export default async function updatePersonalData(personalData: InputPersonalDataType): Promise<IdentityResultType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
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
