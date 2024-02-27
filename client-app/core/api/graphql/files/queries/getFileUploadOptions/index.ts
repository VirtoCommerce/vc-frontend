import { graphqlClient } from "@/core/api/graphql/client";
import { GetFileUploadOptionsDocument } from "./getFileUploadOptions.generated";
import type { GetFileUploadOptionsQuery, GetFileUploadOptionsQueryVariables } from "./getFileUploadOptions.generated";
import type { FileUploadOptionsFragment } from "../../fragments/fileUploadOptions.generated";

export async function getFileUploadOptions(scope: string): Promise<FileUploadOptionsFragment | undefined> {
  const { data } = await graphqlClient.query<GetFileUploadOptionsQuery, GetFileUploadOptionsQueryVariables>({
    query: GetFileUploadOptionsDocument,
    variables: {
      scope,
    },
  });

  return data.fileUploadOptions;
}
