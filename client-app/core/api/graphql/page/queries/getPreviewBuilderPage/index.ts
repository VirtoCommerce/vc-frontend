import { useLazyQuery } from "@vue/apollo-composable";
import { GetPreviewBuilderPageDocument } from "@/core/api/graphql/types";
import type { GetPreviewBuilderPageQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetPreviewBuilderPage(payload: MaybeRefOrGetter<GetPreviewBuilderPageQueryVariables>) {
  return useLazyQuery(GetPreviewBuilderPageDocument, payload, {
    fetchPolicy: "cache-and-network",
  });
}
