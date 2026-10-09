import { GetPageContextDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { GetPageContextQueryVariables } from "@/core/api/graphql/types";

export async function getPageContext(payload: GetPageContextQueryVariables) {
  const { data } = await graphqlClient.query({
    query: GetPageContextDocument,
    variables: payload,
  });

  return data.pageContext;
}
