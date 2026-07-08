import { createI18n as _createI18n } from "vue-i18n";
import type { LocaleMessage } from "@intlify/core-base";

export function createI18n(locale: string, currency: string, fallback?: { locale: string; message: LocaleMessage }) {
  // `locale` may originate from user-controlled input (e.g. a `?cultureName=` query param) and is
  // used below as a dynamic object key. Only accept a plain locale identifier, otherwise fall back,
  // so it can't inject an unexpected property name (CodeQL: remote property injection).
  const safeLocale = /^[a-zA-Z0-9-]+$/.test(locale) ? locale : (fallback?.locale ?? "en");

  let fallbackMessage = {};
  if (fallback) {
    fallbackMessage = {
      [fallback.locale]: fallback.message,
    };
  }

  return _createI18n({
    legacy: false,
    datetimeFormats: {
      en: {
        short: {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
        long: {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        },
      },
      de: {
        short: {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
        long: {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        },
      },
    },
    fallbackLocale: fallback?.locale,
    messages: {
      ...fallbackMessage,
    },
    fallbackWarn: false,
    missingWarn: false,
    numberFormats: {
      [safeLocale]: {
        decimal: {
          style: "decimal",
        },
        currency: {
          style: "currency",
          notation: "standard",
          currency,
        },
      },
    },
  });
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export type I18n = ReturnType<typeof createI18n>;
