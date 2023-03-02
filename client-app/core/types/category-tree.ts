import { Category } from "@/xapi";
import { ModifyType } from "./modify";

export type CategoryTreeItemType = ModifyType<
  Category,
  {
    children: CategoryTreeItemType[];
    parent?: CategoryTreeItemType;
    isRoot?: boolean;
    code?: string;
  }
>;
