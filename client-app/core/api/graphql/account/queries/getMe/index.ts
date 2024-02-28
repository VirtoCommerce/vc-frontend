import { useLazyQuery } from "@vue/apollo-composable";
import { GetMeDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import getMeQueryDocument from "./getMeQuery.graphql";
import type { ContactTypeOrganizationsArgs, Query, UserType } from "@/core/api/graphql/types";

export function useGetMeQuery() {
  return useLazyQuery(GetMeDocument);
}

export async function getMe(): Promise<UserType> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "me">>, ContactTypeOrganizationsArgs>({
    query: getMeQueryDocument,
  });

  return data.me;
}
