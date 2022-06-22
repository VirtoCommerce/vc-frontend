import { Breadcrumb } from "@/xapi/types";

export * from "./search";

export interface CategoryTree extends Record<string, any> {
  isRoot: boolean;
  id?: string;
  parentId?: string;
  parent?: CategoryTree;
  label?: string;
  slug?: string;
  items?: CategoryTree[];
  isCurrent?: boolean;
  seoUrl?: string;
  breadcrumbs?: Breadcrumb[];
}

export interface IBreadcrumbsItem {
  title: string;
  url?: string;
}
