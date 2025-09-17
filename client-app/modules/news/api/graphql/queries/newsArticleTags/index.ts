import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { NewsArticleTagsDocument } from "../../types";
import type { QueryNewsArticleTagsArgs, Query } from "../../types";

export async function getNewsArticleTags(): Promise<string[] | undefined> {
  const { cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "newsArticleTags">>, QueryNewsArticleTagsArgs>({
    query: NewsArticleTagsDocument,
    variables: {
      languageCode: cultureName,
    },
  });

  return data?.newsArticleTags;
}
