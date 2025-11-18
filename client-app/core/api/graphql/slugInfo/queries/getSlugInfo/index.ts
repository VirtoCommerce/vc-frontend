import { useQuery } from "@vue/apollo-composable";
import { GetSlugInfoDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities/logger";
import { graphqlClient } from "../../../client";
import type { Query, QuerySlugInfoArgs } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetSlugInfo(payload: MaybeRefOrGetter<QuerySlugInfoArgs>) {
  return useQuery(GetSlugInfoDocument, payload, { fetchPolicy: "cache-and-network" });
}

export async function getSlugInfo({ permalink, cultureName }: { permalink?: string; cultureName?: string }) {
  const { storeId, userId } = globals;
  const variables = { permalink, storeId, userId, cultureName };

  try {
    const response = await graphqlClient.query<Required<Pick<Query, "slugInfo">>, QuerySlugInfoArgs>({
      query: GetSlugInfoDocument,
      variables,
    });

    return response.data?.slugInfo;
  } catch (error) {
    Logger.error(`Failed to get slug info for permalink: ${permalink} and cultureName: ${cultureName}`, error);

    return null;
  }
}
