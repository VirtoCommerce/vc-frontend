import { createI18n as _createI18n } from "vue-i18n";
import type { LocaleMessage } from "@intlify/core-base";
import type { I18nOptions } from "vue-i18n";

export function createI18n(locale: string, currency: string, fallback?: { locale: string; message: LocaleMessage }) {
  let fallbackMessage = {};
  if (fallback) {
    fallbackMessage = {
      [fallback.locale]: fallback.message,
    };
  }

  const options: I18nOptions = {
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
      [locale]: {
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
  };

  return _createI18n<true, typeof options>(options);
}

export type I18n = ReturnType<typeof createI18n>;
