import { useLazyQuery } from "@vue/apollo-composable";
import { GetMeDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { GetMeQuery } from "@/core/api/graphql/types";

export type UserType = GetMeQuery["me"];

export function useGetMeQuery() {
  return useLazyQuery(GetMeDocument);
}

export async function getMe(userId: string): Promise<UserType> {
  const { data } = await graphqlClient.query({
    query: GetMeDocument,
    variables: {
      userId,
    },
  });

  return data.me;
}
