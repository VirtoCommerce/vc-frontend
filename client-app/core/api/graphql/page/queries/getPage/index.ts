import { useLazyQuery } from "@vue/apollo-composable";
import { GetPageDocument } from "@/core/api/graphql/types";
import type { GetPageQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetPage(payload: MaybeRefOrGetter<GetPageQueryVariables>) {
  return useLazyQuery(GetPageDocument, payload, { fetchPolicy: "cache-and-network" });
}
