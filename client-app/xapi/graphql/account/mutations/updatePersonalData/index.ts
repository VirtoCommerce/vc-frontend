import { InputPersonalDataType, IdentityResultType, Mutations, MutationsUpdatePersonalDataArgs } from "@/xapi/types";
import mutationDocument from "./updatePersonalDataMutation.graphql";

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
