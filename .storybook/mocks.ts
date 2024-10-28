import type { CurrencyType, LanguageType, StoreResponseType } from "@/core/api/graphql/types";

export const defaultLanguage: LanguageType = {
  isInvariant: false,
  cultureName: "en-US",
  nativeName: "English (United States)",
  threeLetterLanguageName: "eng",
  twoLetterLanguageName: "en",
  twoLetterRegionName: "US",
  threeLetterRegionName: "USA",
};

export const defaultCurrency: CurrencyType = {
  code: "USD",
  symbol: "$",
  exchangeRate: 1.0,
  englishName: "US Dollar",
  cultureName: "en-US",
};

export const store: StoreResponseType = {
  availableCurrencies: [defaultCurrency],
  availableLanguages: [
    defaultLanguage,
    // Add other supported languages here
    {
      isInvariant: false,
      cultureName: "fr-FR",
      nativeName: "français (France)",
      threeLetterLanguageName: "fra",
      twoLetterLanguageName: "fr",
      twoLetterRegionName: "FR",
      threeLetterRegionName: "FRA",
    },
    {
      isInvariant: false,
      cultureName: "de-DE",
      nativeName: "Deutsch (Deutschland)",
      threeLetterLanguageName: "deu",
      twoLetterLanguageName: "de",
      twoLetterRegionName: "DE",
      threeLetterRegionName: "DEU",
    },
  ],
  catalogId: "mock",
  defaultCurrency,
  defaultLanguage,
  graphQLSettings: {
    keepAliveInterval: 0,
  },
  settings: {
    anonymousUsersAllowed: false,
    authenticationTypes: [],
    createAnonymousOrderEnabled: false,
    defaultSelectedForCheckout: false,
    emailVerificationEnabled: false,
    emailVerificationRequired: false,
    environmentName: "mock",
    isSpa: false,
    modules: [],
    passwordRequirements: undefined,
    quotesEnabled: false,
    seoLinkType: "mock",
    subscriptionEnabled: false,
    taxCalculationEnabled: false,
  },
  storeId: "mock",
  storeName: "Mock Store",
};
