import { useLazyQuery } from "@vue/apollo-composable";
import { GetSlugInfoDocument } from "@/core/api/graphql/types";
import type { QuerySlugInfoArgs } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetSlugInfo(payload: MaybeRefOrGetter<QuerySlugInfoArgs>) {
  return useLazyQuery(GetSlugInfoDocument, payload, { fetchPolicy: "cache-and-network" });
}
