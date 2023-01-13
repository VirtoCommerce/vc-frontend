import { FacetItem } from "@/core";

export interface ProductsSearchParams {
  itemsPerPage?: number;
  page?: number;
  keyword?: string;
  sort?: string;
  filter?: string;
  fuzzy?: boolean;
  fuzzyLevel?: number;
  categoryId?: string;
  productIds?: string[];
}

export interface ProductsFilters {
  facets: FacetItem[];
  inStock: boolean;
  branches: string[];
}
