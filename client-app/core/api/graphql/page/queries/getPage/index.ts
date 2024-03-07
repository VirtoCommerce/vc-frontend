import { useQuery } from "@vue/apollo-composable";
import { GetPageDocument } from "@/core/api/graphql/types";
import type { QueryPageArgs } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function getPage(payload: MaybeRefOrGetter<QueryPageArgs>) {
  return useQuery(GetPageDocument, payload);
}
