import { graphqlClient } from "@/core/api/graphql";
import getFileUploadOptionsQuery from "./getFileUploadOptions.graphql";
import type { GetFileUploadOptionsQuery, QueryFileUploadOptionsArgs } from "@/core/api/graphql/types";

export async function getFileUploadOptions(scope: string): Promise<GetFileUploadOptionsQuery["fileUploadOptions"]> {
  const { data } = await graphqlClient.query<GetFileUploadOptionsQuery, QueryFileUploadOptionsArgs>({
    query: getFileUploadOptionsQuery,
    variables: {
      scope,
    },
  });

  return data.fileUploadOptions;
}
