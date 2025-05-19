import { useQuery } from "@vue/apollo-composable";
import { GetBrandsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { GetBrandsQueryVariables } from "@/core/api/graphql/types";

export function useGetBrands(payload?: Partial<GetBrandsQueryVariables>) {
  const { storeId, currencyCode, userId, cultureName } = globals;

  return useQuery(GetBrandsDocument, {
    storeId,
    currencyCode,
    userId,
    cultureName,
    ...payload,
  });
}
