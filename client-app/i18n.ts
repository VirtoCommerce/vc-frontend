import { createI18n as _createI18n } from "vue-i18n";
import { LOCALE_ID_REGEX } from "@/core/constants/locale";
import type { LocaleMessage } from "@intlify/core-base";
import type { IntlNumberFormat, PluralizationRule } from "vue-i18n";

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
 * Slavic locales need four plural forms; vue-i18n's built-in rule is locale-blind
 * (`Math.min(n, 2)`), which renders e.g. "2 отзывов" instead of "2 отзыва". `Intl.PluralRules`
 * carries Unicode's CLDR plural data for every language, so the grammar is looked up instead of
 * hand-written: `rules.select(21)` → "one" → slot 1. Intl says WHAT a number is
 * ("one" / "few" / "many"); vue-i18n needs WHICH form to render (an index). This maps one onto
 * the other for our 4-form messages: none | one | few | many.
 */
const PLURAL_SLOT_BY_CATEGORY: Record<Intl.LDMLPluralRule, number> = {
  zero: 0,
  one: 1,
  two: 2,
  few: 2,
  many: 3,
  other: 3,
};

/**
 * vue-i18n's own rule, replicated: intlify passes it as `orgRule` on every render, but the rule
 * can also be called directly (e.g. in tests), where no `orgRule` is provided.
 */
function defaultPluralRule(choice: number, choicesLength: number): number {
  const count = Math.abs(choice);

  if (choicesLength === 2) {
    return count === 1 ? 0 : 1;
  }

  return Math.min(count, 2);
}

export function createIntlPluralRule(locale: string): PluralizationRule {
  const rules = new Intl.PluralRules(locale);

  return (choice, choicesLength, orgRule) => {
    // Messages with fewer than four forms predate this rule and may hardcode a literal "1" in
    // their singular slot (e.g. `pages.catalog.available_variations`), where grammar-aware
    // indexes (21 → "one") would render wrong text. Let vue-i18n pick exactly as it always has.
    if (choicesLength < 4) {
      return (orgRule ?? defaultPluralRule)(choice, choicesLength);
    }

    // Slot 0 is the "none" copy every 4-form message leads with; Intl itself files 0 under `many`.
    if (choice === 0) {
      return 0;
    }

    return PLURAL_SLOT_BY_CATEGORY[rules.select(choice)];
  };
}

export function createI18n(
  locale: string,
  currency: string,
  fallback?: { locale: string; message: LocaleMessage },
  pluralRuleLocales?: string[],
) {
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

  // vue-i18n matches `pluralRules` keys exactly against the locale a message was resolved under:
  // module and ui-kit messages live under two-letter codes ("ru") while global ones live under
  // the store culture name ("ru-RU"), so both spellings of every supported language are needed.
  const pluralRules: Record<string, PluralizationRule> = {};
  for (const pluralRuleLocale of new Set([safeLocale, ...(pluralRuleLocales ?? [])])) {
    try {
      pluralRules[pluralRuleLocale] = createIntlPluralRule(pluralRuleLocale);
    } catch {
      // `Intl.PluralRules` throws on malformed language tags; a misconfigured culture name must
      // not break boot — that locale just keeps vue-i18n's default rule, as before this feature.
    }
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
    pluralRules,
    numberFormats: {
      [safeLocale]: getDefaultNumberFormats(currency),
    },
  });
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export type I18n = ReturnType<typeof createI18n>;
