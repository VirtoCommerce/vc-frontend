import { graphqlClient } from "../../../client";
import getMeQueryDocument from "./getMeQuery.graphql";
import type { ContactTypeOrganizationsArgs, Query, UserType } from "@/core/api/graphql/types";

export async function getMe(): Promise<UserType> {
  const { data } = await graphqlClient.query<Required<Pick<Query, "me">>, ContactTypeOrganizationsArgs>({
    query: getMeQueryDocument,
  });

  return data.me;
}
