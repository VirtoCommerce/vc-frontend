import type { SearchProductFilterResult } from "@/core/api/graphql/types.ts";
import type { FacetItemType } from "@/core/types";

export type ProductsSearchParamsType = {
  page?: number;
  itemsPerPage?: number;
  keyword?: string;
  sort?: string;
  filter?: string;
  fuzzy?: boolean;
  fuzzyLevel?: number;
  categoryId?: string;
  productIds?: string[];
  selectedAddressId?: string;
  selectedAddress?: string;
  preserveUserQuery?: boolean;
};

export type ProductsFiltersType = {
  facets: FacetItemType[];
  filters: SearchProductFilterResult[];
  inStock: boolean;
  purchasedBefore: boolean;
  branches: string[];
};
