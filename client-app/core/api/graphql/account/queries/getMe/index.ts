import { useLazyQuery } from "@vue/apollo-composable";
import { GetMeDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { Query, UserType } from "@/core/api/graphql/types";

export function useGetMeQuery() {
  return useLazyQuery(GetMeDocument);
}

export async function getMe(userId: string): Promise<UserType> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "me">>, { userId: string }>({
    query: GetMeDocument,
    variables: {
      userId,
    },
  });

  return data.me;
}
