import { useI18n } from "vue-i18n";
import { changeDirection, REPORTING_NO_VALUE, REPORTING_PERCENT_DIGITS } from "../reporting";
import type { ReportingChangeDirectionType } from "../reporting";

const ARROWS: Record<ReportingChangeDirectionType, string> = { up: "↑ ", down: "↓ ", flat: "" };
const PERCENT = {
  style: "percent",
  minimumFractionDigits: REPORTING_PERCENT_DIGITS,
  maximumFractionDigits: REPORTING_PERCENT_DIGITS,
} as const;

/** The report's number and date formats, in the user's locale. */
export function useReportingFormatters() {
  const { n, d, locale } = useI18n();

  function money(value: number | null, currency: string): string {
    return value === null ? REPORTING_NO_VALUE : n(value, { style: "currency", currency, maximumFractionDigits: 0 });
  }

  function compactMoney(value: number | null, currency: string): string {
    return value === null
      ? REPORTING_NO_VALUE
      : n(value, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 });
  }

  /** "AOV, $": the symbol alone, taken from a formatted zero so it follows the currency and the locale. */
  function currencySymbol(currency: string): string {
    return n(0, { style: "currency", currency, maximumFractionDigits: 0 }).replace(/[0\s\u00a0]/g, "");
  }

  /** A 0–1 share, e.g. "71.0%". */
  function share(value: number): string {
    return n(value, PERCENT);
  }

  /** "↑ 5.5%", "↓ 4.4%", "0.0%": the badge form of a percent change. */
  function change(percent: number): string {
    return `${ARROWS[changeDirection(percent)]}${n(Math.abs(percent) / 100, PERCENT)}`;
  }

  /** "+23.0%", "−4.4%": the signed form of a percent change, for tooltips and the table. */
  function signedChange(percent: number): string {
    return n(percent / 100, { ...PERCENT, signDisplay: "exceptZero" });
  }

  function month(year: number, monthIndex: number, format: "long" | "short" | "narrow"): string {
    return d(new Date(year, monthIndex, 1), { month: format });
  }

  /** "Oct 2026". */
  function monthYear(year: number, monthIndex: number): string {
    return d(new Date(year, monthIndex, 1), { month: "short", year: "numeric" });
  }

  /** Capitalizes a label that may open with a month name, which most locales write in lower case ("октябрь …"). */
  function sentenceCase(text: string): string {
    return text.charAt(0).toLocaleUpperCase(locale.value) + text.slice(1);
  }

  return { money, compactMoney, currencySymbol, share, change, signedChange, month, monthYear, sentenceCase };
}
