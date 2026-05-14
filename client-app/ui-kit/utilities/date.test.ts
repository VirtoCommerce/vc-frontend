import { CalendarDate } from "@internationalized/date";
import { describe, expect, test } from "vitest";
import {
  deriveDateMaskFromLocale,
  derivePlaceholderFromLocale,
  formatDateLocale,
  parseDateInput,
  toDateOnlyString,
} from "@/ui-kit/utilities/date";

describe("toDateOnlyString", () => {
  test("strips time portion from ISO datetime", () => {
    expect(toDateOnlyString("2026-10-15T12:34:56Z")).toBe("2026-10-15");
  });

  test("returns date-only input unchanged", () => {
    expect(toDateOnlyString("2026-10-15")).toBe("2026-10-15");
  });

  test("returns undefined for empty input", () => {
    expect(toDateOnlyString()).toBeUndefined();
    expect(toDateOnlyString("")).toBeUndefined();
  });
});

describe("parseDateInput", () => {
  describe("locale short format matrix", () => {
    test.each([
      ["en-US", "10/15/2026"],
      ["de-DE", "15.10.2026"],
      ["ru-RU", "15.10.2026"],
      ["ja-JP", "2026/10/15"],
      ["fi-FI", "15.10.2026"],
    ])("parses %s short format %s as 2026-10-15", (locale, text) => {
      const result = parseDateInput(text, locale);
      expect(result).not.toBeNull();
      expect(result?.year).toBe(2026);
      expect(result?.month).toBe(10);
      expect(result?.day).toBe(15);
    });
  });

  describe("ISO passthrough across locales", () => {
    test.each([["en-US"], ["ja-JP"]])("ISO 2026-10-15 parses in %s", (locale) => {
      const result = parseDateInput("2026-10-15", locale);
      expect(result).not.toBeNull();
      expect(result?.year).toBe(2026);
      expect(result?.month).toBe(10);
      expect(result?.day).toBe(15);
    });
  });

  describe("invalid inputs", () => {
    test.each([
      ["empty string", [""]],
      ["whitespace only", ["   "]],
      ["garbage text", ["not a date"]],
      ["partial input (slash and dot)", ["10/", "15.10."]],
      ["only one part", ["2026"]],
      ["letters mixed in", ["10/abc/2026"]],
      ["four parts", ["10/15/2026/01"]],
      ["negative value", ["10/-15/2026"]],
      ["two-digit year (rejected as ambiguous)", ["10/15/26"]],
      ["out-of-range month/day/zero values", ["13/45/2026", "10/45/2026", "00/15/2026", "10/00/2026"]],
      ["year outside 1000–9999", ["10/15/0999", "10/15/10000"]],
      [
        "calendar-impossible dates rejected (Feb 30, Feb 29 in non-leap, April 31)",
        ["2026-02-30", "2026-02-29", "2026-04-31"],
      ],
    ])("returns null for %s", (_label, inputs) => {
      for (const text of inputs) {
        expect(parseDateInput(text, "en-US"), `input=${text}`).toBeNull();
      }
    });

    test("returns null for non-string input", () => {
      // @ts-expect-error - testing runtime guard against non-string input
      expect(parseDateInput(null, "en-US")).toBeNull();
      // @ts-expect-error - testing runtime guard against non-string input
      expect(parseDateInput(123, "en-US")).toBeNull();
    });
  });

  test("trims surrounding whitespace", () => {
    const result = parseDateInput("  10/15/2026  ", "en-US");
    expect(result).not.toBeNull();
    expect(result?.toString()).toBe("2026-10-15");
  });

  test("wrong-locale format does not silently parse", () => {
    expect(parseDateInput("15.10.2026", "en-US")).toBeNull();
    expect(parseDateInput("10/15/2026", "de-DE")).toBeNull();
  });
});

describe("formatDateLocale", () => {
  test.each([
    ["en-US", "10/15/2026"],
    ["de-DE", "15.10.2026"],
    ["ru-RU", "15.10.2026"],
    ["ja-JP", "2026/10/15"],
    ["fi-FI", "15.10.2026"],
  ])("formats CalendarDate(2026, 10, 15) for %s as %s", (locale, expected) => {
    const result = formatDateLocale(new CalendarDate(2026, 10, 15), locale);
    expect(result).toBe(expected);
  });

  test("returns empty string for null/undefined", () => {
    expect(formatDateLocale(null, "en-US")).toBe("");
    expect(formatDateLocale(undefined, "en-US")).toBe("");
  });

  test("round-trips through parseDateInput in every supported locale", () => {
    const date = new CalendarDate(2026, 3, 7);
    for (const locale of ["en-US", "de-DE", "ru-RU", "ja-JP", "fi-FI"]) {
      const formatted = formatDateLocale(date, locale);
      const parsed = parseDateInput(formatted, locale);
      expect(parsed?.toString(), `round-trip failed for ${locale} formatted=${formatted}`).toBe("2026-03-07");
    }
  });
});

describe("derivePlaceholderFromLocale", () => {
  test.each([
    ["en-US", "MM/DD/YYYY"],
    ["de-DE", "DD.MM.YYYY"],
    ["ru-RU", "DD.MM.YYYY"],
    ["ja-JP", "YYYY/MM/DD"],
    ["fi-FI", "DD.MM.YYYY"],
  ])("returns expected hint pattern for %s", (locale, expected) => {
    expect(derivePlaceholderFromLocale(locale)).toBe(expected);
  });

  test("hint shape matches formatDateLocale output shape", () => {
    // Hint and formatted output must share length, separator positions, and digit slots.
    const date = new CalendarDate(2026, 10, 15);
    for (const locale of ["en-US", "de-DE", "ru-RU", "ja-JP", "fi-FI"]) {
      const formatted = formatDateLocale(date, locale);
      const hint = derivePlaceholderFromLocale(locale);
      expect(formatted.length, `length mismatch for locale=${locale}`).toBe(hint.length);
      for (let i = 0; i < hint.length; i++) {
        const hintChar = hint[i];
        const formattedChar = formatted[i];
        if (hintChar === "Y" || hintChar === "M" || hintChar === "D") {
          expect(/\d/.test(formattedChar), `digit expected at index ${i} for locale=${locale}`).toBe(true);
        } else {
          expect(formattedChar, `separator mismatch at index ${i} for locale=${locale}`).toBe(hintChar);
        }
      }
    }
  });
});

describe("deriveDateMaskFromLocale", () => {
  test.each([
    ["en-US", "##/##/####"],
    ["de-DE", "##.##.####"],
    ["ru-RU", "##.##.####"],
    ["ja-JP", "####/##/##"],
    ["fi-FI", "##.##.####"],
  ])("returns expected mask pattern for %s", (locale, expected) => {
    expect(deriveDateMaskFromLocale(locale)).toBe(expected);
  });
});

describe("derivePlaceholderFromLocale — fallback", () => {
  test("returns ISO-shape fallback for unparseable locale", () => {
    // "zzz-zzz-zzz" throws in Intl ("xx-INVALID" is silently tolerated by V8 and won't trigger the catch).
    expect(derivePlaceholderFromLocale("zzz-zzz-zzz")).toBe("YYYY-MM-DD");
  });
});

describe("deriveDateMaskFromLocale — fallback", () => {
  test("returns ISO-shape mask for unparseable locale", () => {
    expect(deriveDateMaskFromLocale("zzz-zzz-zzz")).toBe("####-##-##");
  });
});
