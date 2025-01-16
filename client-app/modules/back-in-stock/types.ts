import type { ISortInfo } from "@/core/types";

export type PaginationType = {
  page: number;
  pages: number;
  itemsPerPage: number;
};

export type FetchParametersType = {
  keyword: string;
  sort: ISortInfo;
  productIds: string[] | undefined;
};
