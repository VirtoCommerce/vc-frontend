export const DEFAULT_BRANDS_PER_PAGE = 5;

const LATIN_UPPERCASE_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export const LATIN_UPPERCASE_LETTERS_MAPPING = LATIN_UPPERCASE_LETTERS.reduce(
  (acc, letter) => {
    acc[letter] = letter;
    return acc;
  },
  {} as Record<string, string>,
);

export const NAV_INDEX_ITEMS = {
  all: "all",
  numbers: "numbers",
  others: "others",
};
