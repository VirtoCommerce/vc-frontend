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
 * Slavic one/few/many, which vue-i18n's built-in rule cannot express: it reads two forms as
 * singular|plural and three as zero|singular|plural, so "2 товара" comes out as "2 товаров".
 * Only four-form messages ("zero | one | few | many") take the Slavic branch — shorter ones keep the
 * built-in index, so ru/pl messages already written against it (`branches`, `available_variations`)
 * are unaffected.
 */
export function slavicPluralRule(choice: number, choicesLength: number): number {
  const count = Math.abs(choice);

  // Mirrors @intlify's pluralDefault.
  if (choicesLength === 2) {
    return count === 1 ? 0 : 1;
  }

  if (choicesLength < 4) {
    return Math.min(count, 2);
  }

  if (count === 0) {
    return 0;
  }

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 1; // one: 1, 21, 101…
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return 2; // few: 2-4, 22-24…
  }

  return 3; // many: 5-20, 25-30…
}

// vue-i18n picks a rule by exact locale id and the app runs on culture names ("ru-RU"), so both forms
// are registered; a culture that isn't listed simply keeps the built-in rule.
const SLAVIC_PLURAL_LOCALES = ["ru", "ru-RU", "pl", "pl-PL"];

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
    pluralRules: Object.fromEntries(SLAVIC_PLURAL_LOCALES.map((pluralLocale) => [pluralLocale, slavicPluralRule])),
    numberFormats: {
      [safeLocale]: getDefaultNumberFormats(currency),
    },
  });
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export type I18n = ReturnType<typeof createI18n>;
