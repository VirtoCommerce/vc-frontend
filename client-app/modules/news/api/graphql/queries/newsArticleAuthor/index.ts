import { graphqlClient } from "@/core/api/graphql/client"; 
import { NewsArticleAuthorDocument  } from "../../types";
import type {  Query, NewsArticleAuthor, QueryNewsArticleAuthorArgs } from "../../types";

export async function getNewsArticleAuthor(authorId: string): Promise<NewsArticleAuthor> { 
  const { data } = await graphqlClient.query<Required<Pick<Query, "newsArticleAuthor">>, QueryNewsArticleAuthorArgs>({
    query: NewsArticleAuthorDocument,
    variables: {
      authorId: authorId,
    },
  });

  return data.newsArticleAuthor;
}
