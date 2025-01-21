import type { MoneyType } from "@/core/api/graphql/types";

export function getMoney(amount: number, culture = "en-US", currencyCode = "USD"): MoneyType {
  const currencyFormat = new Intl.NumberFormat(culture, { currency: currencyCode, style: "currency" });

  const formattedAmount = currencyFormat.format(amount);

  const formattedAmountWithoutCurrency = new Intl.NumberFormat(culture).format(amount);

  const formattedAmountWithoutPoint = new Intl.NumberFormat(culture, {
    ...currencyFormat.resolvedOptions(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const formattedAmountWithoutPointAndCurrency = new Intl.NumberFormat(culture, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return {
    amount,
    decimalDigits: currencyFormat.resolvedOptions().maximumFractionDigits ?? 0,
    formattedAmount,
    formattedAmountWithoutCurrency,
    formattedAmountWithoutPoint,
    formattedAmountWithoutPointAndCurrency,
    currency: {
      code: currencyCode,
      exchangeRate: 1,
      symbol: currencyFormat.formatToParts().find((part) => part.type === "currency")?.value || "",
      cultureName: "",
      englishName: "",
    },
  };
}
