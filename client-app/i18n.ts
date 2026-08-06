import { createI18n as _createI18n } from "vue-i18n";
import { LOCALE_ID_REGEX } from "@/core/constants/locale";
import type { LocaleMessage } from "@intlify/core-base";
import type { IntlNumberFormat } from "vue-i18n";

/**
 * Default per-locale number formats. Registered for the boot locale by `createI18n` and for every
 * locale switched to at runtime by `applyLocale` (see useLanguages), so prices/numbers always
 * format in the active culture instead of silently keeping the boot culture (VCST-5219).
 */
export function getDefaultNumberFormats(currency: string): IntlNumberFormat {
  return {
    decimal: {
      style: "decimal",
    },
    currency: {
      style: "currency",
      notation: "standard",
      currency,
    },
  };
}

/**
 * Slavic locales need four plural forms (zero | one | few | many); vue-i18n's default rule
 * only distinguishes zero | one | other, which renders e.g. "2 отзывов" instead of "2 отзыва".
 * Both rules keep working with legacy 2-3-form messages via the `choicesLength` guard.
 */
export function russianPluralRule(choice: number, choicesLength: number): number {
  if (choice === 0) {
    return 0;
  }

  const teen = choice > 10 && choice < 20;
  const endsWithOne = choice % 10 === 1;

  if (choicesLength < 4) {
    return !teen && endsWithOne ? 1 : 2;
  }

  if (!teen && endsWithOne) {
    return 1;
  }

  if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
    return 2;
  }

  return 3;
}

export function polishPluralRule(choice: number, choicesLength: number): number {
  if (choice === 0) {
    return 0;
  }

  if (choice === 1) {
    return 1;
  }

  if (choicesLength < 4) {
    return 2;
  }

  const few = choice % 10 >= 2 && choice % 10 <= 4 && !(choice % 100 >= 12 && choice % 100 <= 14);

  return few ? 2 : 3;
}

export function createI18n(locale: string, currency: string, fallback?: { locale: string; message: LocaleMessage }) {
  // `locale` may originate from user-controlled input (e.g. a `?cultureName=` query param) and is
  // used below as a dynamic object key. Only accept a plain locale identifier, otherwise fall back,
  // so it can't inject an unexpected property name (CodeQL: remote property injection).
  const safeLocale = LOCALE_ID_REGEX.test(locale) ? locale : (fallback?.locale ?? "en");

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
    pluralRules: {
      ru: russianPluralRule,
      pl: polishPluralRule,
    },
    numberFormats: {
      [safeLocale]: getDefaultNumberFormats(currency),
    },
  });
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export type I18n = ReturnType<typeof createI18n>;
