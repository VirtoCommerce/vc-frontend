import { computed, inject } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { contextInjectionKey } from "@core/injection-keys";
import { Currency } from "@core/types";

export default function useCurrency() {
  const context = inject(contextInjectionKey);
  const currentCurrencyCode = useLocalStorage<string | null>("currency", context!.defaultCurrency!.code || null);

  const currentCurrency = computed<Currency>(
    () => context!.availCurrencies!.find((item) => item.code === currentCurrencyCode.value) || context!.defaultCurrency!
  );

  function setCurrencyByCode(code: string) {
    currentCurrencyCode.value = code;
    location.reload();
  }

  return {
    setCurrencyByCode,
    currentCurrency,
  };
}
