import { graphqlClient } from "@/core/api/graphql/client";
import { DeleteFileDocument } from "./deleteFile.generated";
import type { DeleteFileMutation, DeleteFileMutationVariables } from "./deleteFile.generated";

export async function deleteFile(id: string): Promise<boolean | undefined> {
  const { data } = await graphqlClient.mutate<DeleteFileMutation, DeleteFileMutationVariables>({
    mutation: DeleteFileDocument,
    variables: {
      command: {
        id,
      },
    },
  });
  return data?.deleteFile;
}
