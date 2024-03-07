import { useLazyQuery } from "@vue/apollo-composable";
import { GetPageDocument } from "@/core/api/graphql/types";
import type { GetPageQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function getPage(payload: MaybeRefOrGetter<GetPageQueryVariables>) {
  return useLazyQuery(GetPageDocument, payload);
}
