import _ from "lodash";
import { MenuLinkType } from "@/xapi/types";
import { MenuLink } from "@/shared/layout";

export function prepareSearchText(rawText: string): string {
  // add logic if necessary
  return rawText;
}

export function highlightSearchText(text: string, rawSearchText: string): string {
  const charactersToDelete = _.escapeRegExp("'`\"\\@#$%^&()_.,!?<>:;[]{}/|*+-=");
  const preparedText = prepareSearchText(rawSearchText);
  const searchRegexp = _.escapeRegExp(
    preparedText.replace(new RegExp(`^[\\s${charactersToDelete}]+|[\\s${charactersToDelete}]+$`), "")
  );

  return text.replace(new RegExp(searchRegexp, "ig"), "<span class='font-extrabold'>$&</span>");
}

export function linkListsItemToMenuLink(obj: MenuLinkType): MenuLink {
  return {
    id: obj.url?.split("/").pop(),
    title: obj.title,
    route: obj.url,
    priority: obj.priority,
  };
}
