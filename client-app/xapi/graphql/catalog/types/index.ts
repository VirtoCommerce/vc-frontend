export type SearchResultsParams = {
  keyword: string;
  products?: {
    page?: number;
    itemsPerPage?: number;
    sort?: string;
    fuzzy?: boolean;
    fuzzyLevel?: number;
  };
  categories?: {
    page?: number;
    itemsPerPage?: number;
    sort?: string;
    fuzzy?: boolean;
    fuzzyLevel?: number;
  };
  pages?: {
    page?: number;
    itemsPerPage?: number;
  };
};

export type RelatedProductsSearchParams = {
  productId: string;
  page?: number;
  itemsPerPage?: number;
  group?: string;
  query?: string;
};
