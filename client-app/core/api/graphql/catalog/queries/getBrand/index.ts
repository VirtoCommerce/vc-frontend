import { useQuery } from "@vue/apollo-composable";
import { GetBrandDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useGetBrand(id: string) {
  const { storeId, cultureName } = globals;

  return useQuery(GetBrandDocument, {
    storeId,
    cultureName,
    id,
  });
}
