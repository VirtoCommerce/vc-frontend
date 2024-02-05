import { graphqlClient } from "@/core/api/graphql/client";
import getFileUploadOptionsQuery from "./getFileUploadOptions.graphql";
import type {
  FileUploadOptionsFragment,
  GetFileUploadOptionsQuery,
  QueryFileUploadOptionsArgs,
} from "@/core/api/graphql/types";

export async function getFileUploadOptions(scope: string): Promise<FileUploadOptionsFragment | undefined> {
  const { data } = await graphqlClient.query<GetFileUploadOptionsQuery, QueryFileUploadOptionsArgs>({
    query: getFileUploadOptionsQuery,
    variables: {
      scope,
    },
  });

  return data.fileUploadOptions;
}
