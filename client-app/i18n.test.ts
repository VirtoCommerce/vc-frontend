import { describe, expect, it } from "vitest";
import { createI18n as _createI18n } from "vue-i18n";
import { createSlavicPluralRule } from "./i18n";

/**
 * The rule only reinterprets four-form messages, because the built-in one already assigns a meaning to
 * two and three forms — and ru/pl messages in the repo are written against that meaning.
 */
describe("createSlavicPluralRule", () => {
  const russian = createSlavicPluralRule("ru-RU");
  const polish = createSlavicPluralRule("pl-PL");

  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [4, 2],
    [5, 3],
    [11, 3],
    [12, 3],
    [14, 3],
    [21, 1],
    [22, 2],
    [25, 3],
    [101, 1],
    [111, 3],
  ])("ru four-form message: %i picks form %i", (count, expected) => {
    expect(russian(count, 4)).toBe(expected);
  });

  // Polish agrees with Russian on 1 and on 2-4, and diverges on every OTHER count ending in 1: Russian
  // files those under "one" (21 = "21 pozycja"), Polish under "many" (21 = "21 pozycji").
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [4, 2],
    [5, 3],
    [11, 3],
    [21, 3],
    [22, 2],
    [31, 3],
    [41, 3],
    [101, 3],
    [111, 3],
  ])("pl four-form message: %i picks form %i", (count, expected) => {
    expect(polish(count, 4)).toBe(expected);
  });

  it("differs from the Russian rule on exactly the counts CLDR says it should", () => {
    const diverging = Array.from({ length: 120 }, (_, index) => index + 1).filter(
      (count) => russian(count, 4) !== polish(count, 4),
    );

    // Only counts ending in 1 that are neither 1 itself nor …11 (…11 is "many" in both languages).
    expect(diverging).toEqual([21, 31, 41, 51, 61, 71, 81, 91, 101]);
  });

  it.each([
    [0, 1],
    [1, 0],
    [2, 1],
    [5, 1],
  ])("two-form message keeps the built-in index: %i -> %i", (count, expected) => {
    expect(russian(count, 2)).toBe(expected);
  });

  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [7, 2],
  ])("three-form message keeps the built-in zero|one|other index: %i -> %i", (count, expected) => {
    expect(russian(count, 3)).toBe(expected);
  });
});

describe("Russian pluralization through vue-i18n", () => {
  const i18n = _createI18n({
    legacy: false,
    locale: "ru-RU",
    messages: {
      "ru-RU": {
        items: "товаров | товар | товара | товаров",
        // A three-form message of the kind already in the repo (zero | one | other).
        variations: "Нет вариантов | 1 вариант | {count} вариантов",
      },
    },
    pluralRules: { "ru-RU": createSlavicPluralRule("ru-RU") },
  });

  const t = i18n.global.t;

  it.each([
    [1, "товар"],
    [2, "товара"],
    [3, "товара"],
    [5, "товаров"],
    [21, "товар"],
    [22, "товара"],
    [0, "товаров"],
  ])("renders the right form for %i", (count, expected) => {
    expect(t("items", count)).toBe(expected);
  });

  it("leaves an existing three-form message on its original meaning", () => {
    expect(t("variations", 0)).toBe("Нет вариантов");
    expect(t("variations", 1)).toBe("1 вариант");
    // The plural-only overload also binds {count}, so the "other" slot renders with the number.
    expect(t("variations", 5)).toBe("5 вариантов");
  });
});

describe("Polish pluralization through vue-i18n", () => {
  const i18n = _createI18n({
    legacy: false,
    locale: "pl-PL",
    messages: {
      "pl-PL": {
        items: "pozycji | pozycja | pozycje | pozycji",
      },
    },
    pluralRules: { "pl-PL": createSlavicPluralRule("pl-PL") },
  });

  const t = i18n.global.t;

  it.each([
    [1, "pozycja"],
    [2, "pozycje"],
    [4, "pozycje"],
    [5, "pozycji"],
    [21, "pozycji"],
    [22, "pozycje"],
    [101, "pozycji"],
    [0, "pozycji"],
  ])("renders the right form for %i", (count, expected) => {
    expect(t("items", count)).toBe(expected);
  });
});
