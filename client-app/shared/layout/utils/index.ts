import _ from "lodash";

export function prepareSearchText(rawText: string): string {
  return _.escapeRegExp(_.escape(rawText.trim().replace(/^\W+|\W+$/, "")));
}

export function highlightSearchText(text: string, rawSearchText: string): string {
  const searchRegexp = prepareSearchText(rawSearchText);
  return text.replace(new RegExp(searchRegexp, "ig"), "<span class='font-extrabold'>$&</span>");
}
