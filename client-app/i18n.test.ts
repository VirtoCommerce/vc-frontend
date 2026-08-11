import { describe, expect, it } from "vitest";
import { createI18n as _createI18n } from "vue-i18n";
import { slavicPluralRule } from "./i18n";

/**
 * The rule only reinterprets four-form messages, because the built-in one already assigns a meaning to
 * two and three forms — and ru/pl messages in the repo are written against that meaning.
 */
describe("slavicPluralRule", () => {
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
  ])("four-form message: %i picks form %i", (count, expected) => {
    expect(slavicPluralRule(count, 4)).toBe(expected);
  });

  it.each([
    [0, 1],
    [1, 0],
    [2, 1],
    [5, 1],
  ])("two-form message keeps the built-in index: %i -> %i", (count, expected) => {
    expect(slavicPluralRule(count, 2)).toBe(expected);
  });

  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [7, 2],
  ])("three-form message keeps the built-in zero|one|other index: %i -> %i", (count, expected) => {
    expect(slavicPluralRule(count, 3)).toBe(expected);
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
    pluralRules: { "ru-RU": slavicPluralRule },
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
