import { computed } from "vue";
import { useThemeContext } from "./useThemeContext";
import type { MoneyType, PriceType } from "../api/graphql/types";

export function usePrice(value?: PriceType) {
  const { themeContext } = useThemeContext();

  const { show_prices_with_taxes } = themeContext.value.settings;

  const listPrice = computed<MoneyType | undefined>(() => (show_prices_with_taxes ? value?.listWithTax : value?.list));

  const actualPrice = computed<MoneyType | undefined>(() =>
    show_prices_with_taxes ? value?.actualWithTax : value?.actual
  );

  return {
    actualPrice,
    listPrice,
  };
}
