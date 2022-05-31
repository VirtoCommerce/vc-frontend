import { computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useThemeContext } from "@core/composables";
import { Currency } from "@core/types";

const { themeContext } = useThemeContext();

const savedCurrencyCode = useLocalStorage<string | null>("currency", "");

const defaultCurrency = computed<Currency | undefined>(() => themeContext.value?.defaultCurrency);
const supportedCurrencies = computed<Currency[]>(() => themeContext.value?.availCurrencies || []);
const currentCurrency = computed<Currency | undefined>(
  () => supportedCurrencies.value?.find((item) => item.code === savedCurrencyCode.value) || defaultCurrency.value
);

function saveCurrencyCodeAndReload(code: string) {
  savedCurrencyCode.value = code;
  location.reload();
}

export default function useCurrency() {
  return {
    savedCurrencyCode,
    defaultCurrency,
    supportedCurrencies,
    currentCurrency,
    saveCurrencyCodeAndReload,
  };
}
