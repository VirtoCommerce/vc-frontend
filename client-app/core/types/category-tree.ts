import { Modify } from "@/core";
import { Category } from "@/xapi";

export type CategoryTreeItem = Modify<
  Category,
  {
    children: CategoryTreeItem[];
    parent?: CategoryTreeItem;
    isRoot?: boolean;
    code?: string;
  }
>;
