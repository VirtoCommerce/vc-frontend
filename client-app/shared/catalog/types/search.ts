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
