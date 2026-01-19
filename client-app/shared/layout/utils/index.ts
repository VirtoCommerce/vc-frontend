import { escapeRegExp, trim } from "lodash";

export function prepareSearchText(rawText: string): string {
  // add logic if necessary
  return rawText;
}

// Characters to trim from start/end of search text
const CHARS_TO_TRIM = " \t\n\r'`\"\\@#$%^&()_.,!?<>:;[]{}|/*+=-";

export function highlightSearchText(text: string, rawSearchText: string): string {
  const preparedText = prepareSearchText(rawSearchText);
  const cleanedText = trim(preparedText, CHARS_TO_TRIM);

  if (!cleanedText) {
    return text;
  }

  const searchRegexp = escapeRegExp(cleanedText);

  return text.replace(new RegExp(searchRegexp, "i"), "<span class='font-black'>$&</span>");
}
