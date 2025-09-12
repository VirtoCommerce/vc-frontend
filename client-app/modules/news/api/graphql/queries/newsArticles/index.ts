import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { NewsArticlesDocument } from "../../types";
import type { NewsArticleContentConnection, QueryNewsArticlesArgs, Query } from "../../types";

export async function getNewsArticles(
  payload: Omit<QueryNewsArticlesArgs, "userId" | "storeId" | "languageCode">,
): Promise<NewsArticleContentConnection> {
  const { storeId, cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "newsArticles">>, QueryNewsArticlesArgs>({
    query: NewsArticlesDocument,
    variables: {
      storeId,
      languageCode: cultureName,
      ...payload,
    },
  });

  return data.newsArticles;
}
