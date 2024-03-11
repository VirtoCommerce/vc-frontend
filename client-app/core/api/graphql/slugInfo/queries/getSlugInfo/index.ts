import { useQuery } from "@vue/apollo-composable";
import { GetSlugInfoDocument } from "@/core/api/graphql/types";
import type { QuerySlugInfoArgs } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function getSlugInfo(payload: MaybeRefOrGetter<QuerySlugInfoArgs>) {
  return useQuery(GetSlugInfoDocument, payload, { fetchPolicy: "cache-and-network" });
}
