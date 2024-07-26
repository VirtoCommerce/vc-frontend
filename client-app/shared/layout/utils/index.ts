import { escapeRegExp } from "lodash";

export function prepareSearchText(rawText: string): string {
  // add logic if necessary
  return rawText;
}

export function highlightSearchText(text: string, rawSearchText: string): string {
  const charactersToDelete = escapeRegExp("'`\"\\@#$%^&()_.,!?<>:;[]{}/|*+-=");
  const preparedText = prepareSearchText(rawSearchText);
  const searchRegexp = escapeRegExp(
    preparedText.replace(new RegExp(`^[\\s${charactersToDelete}]+|[\\s${charactersToDelete}]+$`), ""),
  );

  return text.replace(new RegExp(searchRegexp, "i"), "<span class='font-black'>$&</span>");
}
