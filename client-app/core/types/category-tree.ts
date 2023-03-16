import type { ModifyType } from "./modify";
import type { Category } from "@/xapi/types";

export type CategoryTreeItemType = ModifyType<
  Category,
  {
    children: CategoryTreeItemType[];
    parent?: CategoryTreeItemType;
    isRoot?: boolean;
    code?: string;
  }
>;
