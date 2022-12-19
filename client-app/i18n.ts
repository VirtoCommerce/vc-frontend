import { createI18n as _createI18n } from "vue-i18n";

export function createI18n(locale: string, currency: string) {
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
