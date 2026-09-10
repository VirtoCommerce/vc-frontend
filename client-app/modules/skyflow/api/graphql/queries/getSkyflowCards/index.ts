import { useLazyQuery } from "@vue/apollo-composable";
import { globals } from "@/core/globals";
import { GetSkyflowCardsDocument } from "../../types";

export function useGetSkyflowCards() {
  const { storeId } = globals;

  return useLazyQuery(
    GetSkyflowCardsDocument,
    { storeId },
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );
}
