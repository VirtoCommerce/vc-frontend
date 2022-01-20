export type CategoryTree = {
  id?: string;
  parent?: string;
  label?: string;
  slug?: string;
  items?: CategoryTree[];
  isCurrent?: boolean;
  count?: number;
  seoKeyword?: string;
  [x: string]: unknown;
};

export type ProductsSearchParams = {
  categoryId?: string;
  query?: string;
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  filter?: string;
  fuzzy?: boolean;
  fuzzyLevel?: number;
};

export interface IBreadcrumbsItem {
  url: string;
  title: string;
}
