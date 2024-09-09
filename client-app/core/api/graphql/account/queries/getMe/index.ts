import { useLazyQuery } from "@vue/apollo-composable";
import { GetMeDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import getMeQueryDocument from "./getMeQuery.graphql";
import type { Query, UserType } from "@/core/api/graphql/types";

export function useGetMeQuery() {
  return useLazyQuery(GetMeDocument);
}

export async function getMe(userId: string): Promise<UserType> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "me">>, { userId: string }>({
    query: getMeQueryDocument,
    variables: {
      userId,
    },
  });

  return data.me;
}
