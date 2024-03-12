import { useLazyQuery } from "@vue/apollo-composable";
import { GetSkyflowCardsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useGetSkyflowCards() {
  const { storeId, userId } = globals;

  return useLazyQuery(GetSkyflowCardsDocument, { storeId, userId });
}
