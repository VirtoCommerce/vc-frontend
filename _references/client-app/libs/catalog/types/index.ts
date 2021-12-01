
export type CategoryTree = {
    parent?: string;
    label?: string;
    slug?: string;
    items?: CategoryTree[];
    isCurrent?: boolean;
    count?: number;
    [x: string]: unknown;
  }

  export type ProductsSearchParams = {
    categoryId?: string;
    term?: string;
    page?: number;
    itemsPerPage?: number;
    sort?: string;
    [x: string]: any;
  }