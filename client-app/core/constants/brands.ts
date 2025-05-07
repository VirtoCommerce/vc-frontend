export const DEFAULT_BRANDS_PER_PAGE = 5;

const LATIN_UPPERCASE_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export const LATIN_UPPERCASE_LETTERS_MAPPING = Object.fromEntries(
  LATIN_UPPERCASE_LETTERS.map((letter) => [letter, letter]),
);

export const NAV_INDEX_ITEMS = {
  all: "all",
  numbers: "numbers",
  others: "others",
};
