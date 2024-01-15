import { graphqlClient } from "@/core/api/graphql";
import deleteFileMutation from "./deleteFile.graphql";
import type { DeleteFileMutation, MutationsDeleteFileArgs } from "@/core/api/graphql/types";

export async function deleteFile(id: string): Promise<DeleteFileMutation["deleteFile"]> {
  const { data } = await graphqlClient.mutate<DeleteFileMutation, MutationsDeleteFileArgs>({
    mutation: deleteFileMutation,
    variables: {
      command: {
        id,
      },
    },
  });
  return data?.deleteFile;
}
