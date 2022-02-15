export * from "./search";

export type CategoryTree = {
  id?: string;
  parent?: string;
  label?: string;
  slug?: string;
  items?: CategoryTree[];
  isCurrent?: boolean;
  count?: number;
  seoUrl?: string;
};

export interface IBreadcrumbsItem {
  title: string;
  url?: string;
}
