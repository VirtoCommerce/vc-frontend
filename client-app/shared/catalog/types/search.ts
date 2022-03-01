export type ProductsSearchParams = {
  page: number;
  itemsPerPage: number;
  keyword: string;
  sort: string;
  filter: string;
  fuzzy?: boolean;
  fuzzyLevel?: number;
  categoryId?: string;
};

export type ProductsFilterValue = {
  count: number;
  selected: boolean;
  label: string;
  value: string;
};

export type ProductsFilter = {
  label: string;
  paramName: string;
  type: "term" | "range";
  values: ProductsFilterValue[];
};

export type UseProductsSearchParamsOptions = {
  sortList?: string[];
  defaultSortBy?: string;
  itemsPerPageList?: number[];
  defaultItemsPerPage?: number;
  // @default "push"
  routeUpdateMethod?: "push" | "replace";
};

export type FromRouteQueryOptions = {
  sortList?: string[];
  defaultSortBy?: string;
  itemsPerPageList?: number[];
  defaultItemsPerPage?: number;
};
