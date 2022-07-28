export type ProductsSearchParams = {
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

export type ProductsFacetValue = {
  count: number;
  selected: boolean;
  label: string;
  value: string;
};

export type ProductsFacet = {
  label: string;
  paramName: string;
  type: "term" | "range";
  values: ProductsFacetValue[];
};

export type ProductsFilters = {
  facets: ProductsFacet[];
  inStock: boolean;
  availableIn?: string[];
};
