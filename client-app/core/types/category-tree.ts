import { Category } from "@/xapi";
import { Modify } from "@/core";

export type CategoryTreeItem = Modify<
  Category,
  {
    children: CategoryTreeItem[];
    parent?: CategoryTreeItem;
    isRoot?: boolean;
    code?: string;
  }
>;
