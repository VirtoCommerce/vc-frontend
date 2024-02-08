import { graphqlClient } from "@/core/api/graphql/client";
import deleteFileMutation from "./deleteFile.graphql";
import type { DeleteFileMutation, MutationsDeleteFileArgs } from "@/core/api/graphql/types";

export async function deleteFile(id: string): Promise<boolean | undefined> {
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
