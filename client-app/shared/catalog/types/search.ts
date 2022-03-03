export type ProductsSearchParams = {
  page: number;
  itemsPerPage: number;
  keyword: string;
  sort: string;
  filter: string;
  fuzzy?: boolean;
  fuzzyLevel?: number;
  categoryId?: string;
  productIds?: string[];
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

export type UrlParamKeys = {
  [key in keyof Omit<
    ProductsSearchParams,
    "categoryId" | "fuzzy" | "fuzzyLevel" | "productIds"
  > as `${key}Key`]?: string;
};

export type UseProductsSearchParamsOptions = {
  sortList?: string[];
  defaultSortBy?: string;
  itemsPerPageList?: number[];
  defaultItemsPerPage?: number;
  urlParamKeys?: UrlParamKeys;
};

export type FromRouteQueryOptions = {
  urlParamKeys: Required<UrlParamKeys>;
  sortList?: string[];
  defaultSortBy?: string;
  itemsPerPageList?: number[];
  defaultItemsPerPage?: number;
};

export type ToRouteQueryOptions = {
  urlParamKeys: Required<UrlParamKeys>;
};
