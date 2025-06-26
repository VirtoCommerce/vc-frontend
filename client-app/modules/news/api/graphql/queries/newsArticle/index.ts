import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { NewsArticleDocument } from "../../types";
import type { NewsArticleContent, QueryNewsArticleArgs, Query } from "../../types";

export async function getNewsArticle(payload?: QueryNewsArticleArgs): Promise<NewsArticleContent> {
  const { storeId, cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "newsArticle">>, QueryNewsArticleArgs>({
    query: NewsArticleDocument,
    variables: {
      id: payload?.id ?? "",
      storeId,
      languageCode: cultureName,
      ...payload,
    },
  });

  return data.newsArticle;
}
