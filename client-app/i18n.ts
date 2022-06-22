import { createI18n as _createI18n, IntlDateTimeFormats } from "vue-i18n";

export type I18n = ReturnType<typeof createI18n>;

const datetimeFormats: IntlDateTimeFormats = {
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
};

export function createI18n() {
  return _createI18n({
    legacy: false,
    globalInjection: true,
    datetimeFormats,
  });
}
