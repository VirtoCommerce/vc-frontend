import { NAV_INDEX_ITEMS } from "@/core/constants/brands";

export function getGroupByLetter(letter: string) {
  if (/^[A-Za-z]$/.test(letter)) {
    return letter.toUpperCase();
  } else if (/^\d$/.test(letter)) {
    return NAV_INDEX_ITEMS.numbers;
  } else {
    return NAV_INDEX_ITEMS.others;
  }
}
