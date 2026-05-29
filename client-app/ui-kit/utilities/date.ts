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

/** Discovers the locale's short-format field order and separator via Intl. Returns null for non-numeric/RTL locales. */
function probeLocaleDateFormat(locale: string): ILocaleDateFormatProbe | null {
  if (localeFormatProbeCache.has(locale)) {
    return localeFormatProbeCache.get(locale) ?? null;
  }

  try {
    // Explicit 4-digit year: Intl's "short" yields 2-digit years our parser would reject.
    const probe = new Date(Date.UTC(2026, 0, 5));
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

/** Constructs and round-trip-verifies a CalendarDate; rejects silent month overflow (Feb 30 → Mar 2 etc.). */
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
    // Re-parse to catch any normalizations the constructor allowed.
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

/** Parses a user-typed date in the locale's short format or ISO YYYY-MM-DD. Returns null otherwise. */
export function parseDateInput(text: string, locale: string): CalendarDate | null {
  if (typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  // ISO is unambiguous — try it before locale-specific parsing.
  const isoResult = tryParseIso(trimmed);
  if (isoResult) {
    return isoResult;
  }

  const probe = probeLocaleDateFormat(locale);
  if (!probe) {
    return null;
  }

  const tokens = trimmed.split(probe.separator);
  if (tokens.length !== 3) {
    return null;
  }

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

  // 4-digit year required — two-digit years are ambiguous.
  if (year < 1000 || year > 9999) {
    return null;
  }

  return buildValidCalendarDate(year, month, day);
}

/** Formats a CalendarDate in the locale's short layout with explicit 4-digit year so output round-trips through parseDateInput. Returns "" for null/undefined. */
export function formatDateLocale(value: CalendarDate | null | undefined, locale: string): string {
  if (!value) {
    return "";
  }

  try {
    // Render in UTC to prevent local-TZ drift shifting the formatted calendar day.
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

/** Returns a placeholder hint like "MM/DD/YYYY" / "DD.MM.YYYY" / "YYYY/MM/DD" matching the locale's short format. Falls back to "YYYY-MM-DD". */
export function derivePlaceholderFromLocale(locale: string): string {
  try {
    const probe = new Date(Date.UTC(2026, 0, 5));
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

/** Returns a maska pattern (D/M/Y → "#") matching the locale's short format. Falls back to "####-##-##". */
export function deriveDateMaskFromLocale(locale: string): string {
  return derivePlaceholderFromLocale(locale).replace(/[DMY]/g, "#");
}
