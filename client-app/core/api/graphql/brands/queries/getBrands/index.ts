import { useQuery } from "@vue/apollo-composable";
import { GetBrandsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { GetBrandsQueryVariables } from "@/core/api/graphql/types";

const LIMIT = 1000;

export const useGetBrands = (variables: Partial<GetBrandsQueryVariables> = { first: LIMIT }) => {
  const { storeId, cultureName } = globals;

  return useQuery(GetBrandsDocument, {
    storeId,
    cultureName,
    ...variables,
  });
};
