import { useMutation } from "@vue/apollo-composable";
import { getSlugInfo } from "@/core/api/graphql/slugInfo/queries/getSlugInfo";
import { ChangeCartCurrencyDocument } from "@/core/api/graphql/types";
import { useCurrency } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { languageToCountryMap } from "@/core/constants";
import { globals } from "@/core/globals";
import { dataChangedEvent, useBroadcast } from "@/shared/broadcast";
import { useShortCart } from "@/shared/cart";
import type { ILanguage } from "@/core/types";

/**
 * Currency and language switching, shared by the header locale pill and the standalone
 * selectors. Both carry side effects the callers must not reimplement: a currency change
 * re-prices the cart through a mutation, a language change resolves the current page's
 * slug in the target culture before reloading.
 */
export function useLocaleSwitch() {
  const { currentCurrency, supportedCurrencies, saveCurrencyCode } = useCurrency();
  const {
    supportedLanguages,
    currentLanguage,
    pinLocale,
    removeLocaleFromUrl,
    previousCultureSlug,
    getUrlWithoutLocale,
  } = useLanguages();
  const { cart } = useShortCart();
  const { mutate: changeCartCurrency } = useMutation(ChangeCartCurrencyDocument);
  const broadcast = useBroadcast();

  async function selectCurrency(code: string): Promise<void> {
    if (currentCurrency.value?.code === code) {
      return;
    }

    const { userId, storeId, cultureName, currencyCode } = globals;

    if (cart.value) {
      await changeCartCurrency({
        command: {
          userId,
          cartId: cart.value.id,
          newCurrencyCode: code,
          storeId,
          cultureName,
          currencyCode,
        },
      });
    }

    void broadcast.emit(dataChangedEvent);

    saveCurrencyCode(code);
  }

  async function selectLanguage(cultureName: string): Promise<void> {
    pinLocale(cultureName);

    if (cultureName === currentLanguage.value?.cultureName) {
      return;
    }

    const permalink = location.pathname.slice(1);
    const slugInfo = await getSlugInfo({ permalink, cultureName });

    if (slugInfo?.entityInfo) {
      previousCultureSlug.value = {
        cultureName: "",
        slug: "",
      };
    } else {
      previousCultureSlug.value = {
        cultureName: currentLanguage.value?.cultureName,
        slug: getUrlWithoutLocale(location.pathname).slice(1),
      };
    }

    removeLocaleFromUrl();
    void broadcast.emit(dataChangedEvent);
    location.reload();
  }

  function getCountryCode(language: ILanguage): string {
    return (
      languageToCountryMap[language.cultureName.toLocaleLowerCase()] ||
      languageToCountryMap[language.twoLetterLanguageName] ||
      "xx"
    );
  }

  return {
    currentCurrency,
    supportedCurrencies,
    currentLanguage,
    supportedLanguages,
    selectCurrency,
    selectLanguage,
    getCountryCode,
  };
}
