import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { useUser } from "@/shared/account/composables/useUser";
import { useThemeContext } from "./useThemeContext";
import type { ICurrency } from "../types";

const { themeContext } = useThemeContext();
const { user } = useUser();

const savedCurrencyCode = useLocalStorage<string | null>("currency", "");

const defaultCurrency = computed<ICurrency>(() => themeContext.value.defaultCurrency);
const supportedCurrencies = computed<ICurrency[]>(() => themeContext.value.availableCurrencies);
const contactCurrency = computed(() =>
  supportedCurrencies.value?.find((item) => item.code === user.value?.contact?.currencyCode),
);
const currentCurrency = computed<ICurrency>(
  () =>
    supportedCurrencies.value?.find((item) => item.code === savedCurrencyCode.value) ||
    contactCurrency.value ||
    defaultCurrency.value,
);

function saveCurrencyCode(code: string, needToReload: boolean = true) {
  savedCurrencyCode.value = code;

  if (needToReload) {
    location.reload();
  }
}

export function useCurrency() {
  return {
    savedCurrencyCode,
    defaultCurrency,
    supportedCurrencies,
    currentCurrency,
    saveCurrencyCode,
  };
}
