import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import type { ICurrency } from "../types";
import { useThemeContext } from "./useThemeContext";

const { themeContext } = useThemeContext();

const savedCurrencyCode = useLocalStorage<string | null>("currency", "");

const defaultCurrency = computed<ICurrency>(() => themeContext.value.defaultCurrency);
const supportedCurrencies = computed<ICurrency[]>(() => themeContext.value.availCurrencies);
const currentCurrency = computed<ICurrency>(
  () => supportedCurrencies.value?.find((item) => item.code === savedCurrencyCode.value) || defaultCurrency.value
);

function saveCurrencyCodeAndReload(code: string) {
  savedCurrencyCode.value = code;
  location.reload();
}

export function useCurrency() {
  return {
    savedCurrencyCode,
    defaultCurrency,
    supportedCurrencies,
    currentCurrency,
    saveCurrencyCodeAndReload,
  };
}
