import client from "@core/api/graphql/graphql-client";
import { InputPersonalDataType, IdentityResultType } from "@core/api/graphql/types"
import mutationDocument from './updatePersonalDataMutation.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updatePersonalData(personalData: InputPersonalDataType): Promise<IdentityResultType> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        personalData
      }
    }
  });
  return data?.updatePersonalData;
}
export default updatePersonalData;
