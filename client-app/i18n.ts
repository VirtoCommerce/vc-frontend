import { createI18n as _createI18n } from "vue-i18n";
import type { LocaleMessage } from "@intlify/core-base";

export function createI18n(locale: string, currency: string, fallback: { locale: string; message: LocaleMessage }) {
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
    fallbackLocale: fallback.locale,
    messages: {
      [fallback.locale]: fallback.message,
    },
    fallbackWarn: false,
    missingWarn: false,
    numberFormats: {
      [locale]: {
        currency: {
          style: "currency",
          notation: "standard",
          currency,
        },
      },
    },
  });
}

export type I18n = ReturnType<typeof createI18n>;
