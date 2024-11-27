import { useLazyQuery } from "@vue/apollo-composable";
import { GetPageDocumentDocument } from "@/core/api/graphql/types";
import type { GetPageDocumentQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetPageDocument(payload: MaybeRefOrGetter<GetPageDocumentQueryVariables>) {
  return useLazyQuery(GetPageDocumentDocument, payload, { fetchPolicy: "cache-and-network" });
}
