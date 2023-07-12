import { computed } from "vue";
import { useThemeContext } from "./useThemeContext";
import type { MoneyType, PriceType } from "../api/graphql/types";

export function useCatalogPrice(value?: PriceType) {
  const { themeContext } = useThemeContext();

  const { show_prices_with_taxes } = themeContext.value.settings;

  const listPrice = computed<MoneyType | undefined>(() => (show_prices_with_taxes ? value?.listWithTax : value?.list));
  const salePrice = computed<MoneyType | undefined>(() => (show_prices_with_taxes ? value?.saleWithTax : value?.sale));
  const actualPrice = computed<MoneyType | undefined>(() =>
    show_prices_with_taxes ? value?.actualWithTax : value?.actual
  );
  const discountAmount = computed<MoneyType | undefined>(() =>
    show_prices_with_taxes ? value?.discountAmountWithTax : value?.discountAmount
  );

  return {
    listPrice,
    salePrice,
    actualPrice,
    discountAmount,
  };
}
