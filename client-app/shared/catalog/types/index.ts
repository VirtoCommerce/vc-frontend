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
  term?: string;
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  [x: string]: any;
};
