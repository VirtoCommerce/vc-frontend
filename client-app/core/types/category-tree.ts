import type { ModifyType } from "./modify";
import type { Category } from "@/core/api/graphql/types";

export type CategoryTreeItemType = ModifyType<
  Category,
  {
    children: CategoryTreeItemType[];
    parent?: CategoryTreeItemType;
    isRoot?: boolean;
    code?: string;
  }
>;

export interface IMarkedCategory extends Category {
  isActive?: boolean;
  childCategories: IMarkedCategory[];
}
