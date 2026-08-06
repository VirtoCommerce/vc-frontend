import { describe, expect, it } from "vitest";
import { createI18n, polishPluralRule, russianPluralRule } from "./i18n";

const RU_REVIEWS = "нет отзывов | {n} отзыв | {n} отзыва | {n} отзывов";
const PL_REVIEWS = "brak opinii | {n} opinia | {n} opinie | {n} opinii";

describe("russianPluralRule", () => {
  it.each([
    [0, "нет отзывов"],
    [1, "1 отзыв"],
    [2, "2 отзыва"],
    [3, "3 отзыва"],
    [4, "4 отзыва"],
    [5, "5 отзывов"],
    [11, "11 отзывов"],
    [12, "12 отзывов"],
    [14, "14 отзывов"],
    [21, "21 отзыв"],
    [22, "22 отзыва"],
    [25, "25 отзывов"],
    [101, "101 отзыв"],
  ])("renders correct form for %i", (count, expected) => {
    const i18n = createI18n("ru", "USD");
    i18n.global.setLocaleMessage("ru", { reviews: RU_REVIEWS });
    i18n.global.locale.value = "ru";

    expect(i18n.global.t("reviews", count)).toBe(expected);
  });

  it("keeps legacy three-form messages working", () => {
    // 3 forms follow the repo's zero | one | many layout
    expect(russianPluralRule(1, 3)).toBe(1);
    expect(russianPluralRule(2, 3)).toBe(2);
    expect(russianPluralRule(5, 3)).toBe(2);
    expect(russianPluralRule(21, 3)).toBe(1);
  });
});

describe("polishPluralRule", () => {
  it.each([
    [0, "brak opinii"],
    [1, "1 opinia"],
    [2, "2 opinie"],
    [4, "4 opinie"],
    [5, "5 opinii"],
    [12, "12 opinii"],
    [14, "14 opinii"],
    [21, "21 opinii"],
    [22, "22 opinie"],
    [25, "25 opinii"],
  ])("renders correct form for %i", (count, expected) => {
    const i18n = createI18n("pl", "USD");
    i18n.global.setLocaleMessage("pl", { reviews: PL_REVIEWS });
    i18n.global.locale.value = "pl";

    expect(i18n.global.t("reviews", count)).toBe(expected);
  });

  it("keeps legacy three-form messages working", () => {
    expect(polishPluralRule(1, 3)).toBe(1);
    expect(polishPluralRule(2, 3)).toBe(2);
    expect(polishPluralRule(21, 3)).toBe(2);
  });
});
