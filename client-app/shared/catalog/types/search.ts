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
};

export type ProductsFiltersType = {
  facets: FacetItemType[];
  inStock: boolean;
  branches: string[];
};
