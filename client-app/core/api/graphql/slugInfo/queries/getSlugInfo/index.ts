import { useQuery } from "@vue/apollo-composable";
import { GetSlugInfoDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getSlugInfoDocument from "./getSlugInfoQuery.graphql";
import type { Query, GetSlugInfoQuery, QuerySlugInfoArgs } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export async function getSlugInfo(payload?: QuerySlugInfoArgs): Promise<GetSlugInfoQuery["slugInfo"]> {
  const { storeId, userId, cultureName } = globals;
  const { data } = await graphqlClient.query<Required<Pick<Query, "slugInfo">>, QuerySlugInfoArgs>({
    query: getSlugInfoDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      ...payload,
    },
  });
  return data.slugInfo;
}

export function getSlugInfoNew(payload: MaybeRefOrGetter<QuerySlugInfoArgs>) {
  return useQuery(GetSlugInfoDocument, payload);
}
