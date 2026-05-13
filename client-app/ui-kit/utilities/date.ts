import { CalendarDate, parseDate } from "@internationalized/date";

export function toDateOnlyString(isoDate?: string): string | undefined {
  if (!isoDate) {
    return undefined;
  }
  return isoDate.split("T")[0];
}

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

interface ILocaleDateFormatProbe {
  order: ReadonlyArray<"year" | "month" | "day">;
  separator: string;
}

const localeFormatProbeCache = new Map<string, ILocaleDateFormatProbe | null>();

/**
 * Probe Intl.DateTimeFormat to discover the locale's short-format field order
 * (day/month/year) and the literal separator between them.
 * Returns null if probing fails (e.g. non-numeric/RTL locales we can't parse).
 */
function probeLocaleDateFormat(locale: string): ILocaleDateFormatProbe | null {
  if (localeFormatProbeCache.has(locale)) {
    return localeFormatProbeCache.get(locale) ?? null;
  }

  try {
    // Pick a probe date whose day/month/year values are all distinct and unambiguous.
    const probe = new Date(Date.UTC(2026, 0, 5)); // 2026-01-05
    // Use explicit 4-digit year so round-trip with formatDateLocale is consistent
    // across locales (Intl's "short" yields 2-digit years in en-US/de-DE).
    const parts = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).formatToParts(probe);

    const order: Array<"year" | "month" | "day"> = [];
    const literals: string[] = [];

    for (const part of parts) {
      if (part.type === "year" || part.type === "month" || part.type === "day") {
        order.push(part.type);
      } else if (part.type === "literal") {
        literals.push(part.value);
      }
    }

    if (order.length !== 3) {
      localeFormatProbeCache.set(locale, null);
      return null;
    }

    // Pick the separator: the most common literal between numeric parts.
    // Most locales produce a single literal like "/", ".", "-".
    const separator = literals.find((s) => s && s.trim().length > 0) ?? "/";

    const result: ILocaleDateFormatProbe = { order, separator };
    localeFormatProbeCache.set(locale, result);
    return result;
  } catch {
    localeFormatProbeCache.set(locale, null);
    return null;
  }
}

function tryParseIso(text: string): CalendarDate | null {
  const match = ISO_DATE_REGEX.exec(text);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return buildValidCalendarDate(year, month, day);
}

/**
 * Construct a CalendarDate and verify the components survive a round-trip
 * (guards against silent month overflow like Feb 30 → Mar 2 in some libraries).
 * `@internationalized/date` actually throws on invalid components, but we
 * double-check explicitly to be defensive.
 */
function buildValidCalendarDate(year: number, month: number, day: number): CalendarDate | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (year < 1000 || year > 9999) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }

  try {
    const cd = new CalendarDate(year, month, day);
    if (cd.year !== year || cd.month !== month || cd.day !== day) {
      return null;
    }
    // Use parseDate to catch any normalizations the constructor might allow.
    const iso = cd.toString();
    const reparsed = parseDate(iso);
    if (reparsed.year !== year || reparsed.month !== month || reparsed.day !== day) {
      return null;
    }
    return cd;
  } catch {
    return null;
  }
}

/**
 * Locale-aware parsing of a user-typed date string.
 * Accepts the locale's short format (per Intl.DateTimeFormat with dateStyle: "short")
 * AND ISO YYYY-MM-DD. Returns null for anything else.
 */
export function parseDateInput(text: string, locale: string): CalendarDate | null {
  if (typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  // 1. Try ISO YYYY-MM-DD first — this is unambiguous.
  const isoResult = tryParseIso(trimmed);
  if (isoResult) {
    return isoResult;
  }

  // 2. Probe the locale's short format, then split user input by that separator.
  const probe = probeLocaleDateFormat(locale);
  if (!probe) {
    return null;
  }

  const tokens = trimmed.split(probe.separator);
  if (tokens.length !== 3) {
    return null;
  }

  // All tokens must be numeric integers with no extraneous chars.
  const parsedTokens: number[] = [];
  for (const token of tokens) {
    const t = token.trim();
    if (!/^\d+$/.test(t)) {
      return null;
    }
    parsedTokens.push(Number(t));
  }

  let year = 0;
  let month = 0;
  let day = 0;

  for (let i = 0; i < probe.order.length; i++) {
    const field = probe.order[i];
    const value = parsedTokens[i];
    if (field === "year") {
      year = value;
    } else if (field === "month") {
      month = value;
    } else {
      day = value;
    }
  }

  // We require a 4-digit year (1000–9999). Two-digit years are ambiguous; reject them.
  if (year < 1000 || year > 9999) {
    return null;
  }

  return buildValidCalendarDate(year, month, day);
}

/**
 * Format a CalendarDate using the locale's short date layout, but with an
 * explicit 4-digit year and 2-digit month/day. This guarantees the output
 * round-trips through parseDateInput in every supported locale (Intl's
 * `dateStyle: "short"` produces 2-digit years in en-US/de-DE which collides
 * with our 4-digit-year-only parsing rule).
 *
 * Returns "" for null/undefined input.
 */
export function formatDateLocale(value: CalendarDate | null | undefined, locale: string): string {
  if (!value) {
    return "";
  }

  try {
    // CalendarDate.toDate requires a time zone; UTC is safe because the
    // resulting Date represents midnight UTC of the same calendar day,
    // and we render in UTC to avoid TZ drift in the formatted string.
    const date = new Date(Date.UTC(value.year, value.month - 1, value.day));
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return "";
  }
}

/**
 * High-level: take user input text → return canonical ISO YYYY-MM-DD or null.
 * Accepts locale-formatted strings AND ISO strings.
 */
export function parseDateInputToIso(text: string, locale: string): string | null {
  const cd = parseDateInput(text, locale);
  if (!cd) {
    return null;
  }
  return cd.toString();
}

/**
 * Derive a static placeholder hint pattern reflecting the locale's short
 * date format. Uses `Intl.DateTimeFormat.formatToParts` to discover field
 * order and literal separators, then maps:
 *   - day → "DD"
 *   - month → "MM"
 *   - year → "YYYY"
 *   - literal (separator) → verbatim
 *
 * Suitable for use as a plain `<input placeholder>` value. Falls back to
 * `"YYYY-MM-DD"` (ISO) when probing fails (rare non-numeric/RTL locales).
 *
 * Examples:
 *   en-US  → "MM/DD/YYYY"
 *   de-DE  → "DD.MM.YYYY"
 *   ru-RU  → "DD.MM.YYYY"
 *   ja-JP  → "YYYY/MM/DD"
 *   fi-FI  → "DD.MM.YYYY"
 */
export function derivePlaceholderFromLocale(locale: string): string {
  try {
    const probe = new Date(Date.UTC(2026, 0, 5)); // 2026-01-05
    const parts = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).formatToParts(probe);

    const hint = parts
      .map((part) => {
        if (part.type === "day") {
          return "DD";
        }
        if (part.type === "month") {
          return "MM";
        }
        if (part.type === "year") {
          return "YYYY";
        }
        if (part.type === "literal") {
          return part.value;
        }
        return "";
      })
      .join("");

    if (!hint) {
      return "YYYY-MM-DD";
    }
    return hint;
  } catch {
    return "YYYY-MM-DD";
  }
}

/**
 * Derive a maska-compatible mask pattern for the given locale.
 *
 * Builds on `derivePlaceholderFromLocale`: replaces D/M/Y placeholder
 * characters with `#` (maska's token for any digit) and preserves the
 * locale's separators verbatim.
 *
 * Examples:
 *   en-US  → "##/##/####"
 *   de-DE  → "##.##.####"
 *   ru-RU  → "##.##.####"
 *   ja-JP  → "####/##/##"
 *   fi-FI  → "##.##.####"
 *
 * Returns "####-##-##" (ISO shape) as a safe fallback if probing fails
 * (mirrors `derivePlaceholderFromLocale`'s ISO fallback).
 */
export function deriveDateMaskFromLocale(locale: string): string {
  return derivePlaceholderFromLocale(locale).replace(/[DMY]/g, "#");
}
