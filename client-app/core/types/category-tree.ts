import type { Category } from "@/xapi/types";
import type { ModifyType } from "./modify";

export type CategoryTreeItemType = ModifyType<
  Category,
  {
    children: CategoryTreeItemType[];
    parent?: CategoryTreeItemType;
    isRoot?: boolean;
    code?: string;
  }
>;
