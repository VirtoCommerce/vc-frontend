import { useQuery } from "@vue/apollo-composable";
import { GetBrandsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { GetBrandsQueryVariables } from "@/core/api/graphql/types";

export const useGetBrands = (variables: Partial<GetBrandsQueryVariables> = { first: 1000 }) => {
  const { storeId, cultureName } = globals;

  return useQuery(GetBrandsDocument, {
    storeId,
    cultureName,
    ...variables,
  });
};
