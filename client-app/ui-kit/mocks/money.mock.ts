import type { MoneyType } from "@/core/api/graphql/types";

export function getMoney(amount: number, currencyCode = "USD"): MoneyType {
  const culture = "en-US";
  const decimalDigits = 2;

  const fractionDigits = {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  };

  const formattedAmount = new Intl.NumberFormat(culture, {
    currency: currencyCode,
    style: "currency",
    ...fractionDigits,
  }).format(amount);

  const formattedAmountWithoutCurrency = new Intl.NumberFormat(culture, {
    ...fractionDigits,
  }).format(amount);

  const formattedAmountWithoutPoint = new Intl.NumberFormat(culture, {
    currency: currencyCode,
    style: "currency",
    maximumFractionDigits: 0,
  }).format(amount);

  const formattedAmountWithoutPointAndCurrency = new Intl.NumberFormat(culture, {
    maximumFractionDigits: 0,
  }).format(amount);

  return {
    amount,
    decimalDigits,
    formattedAmount,
    formattedAmountWithoutCurrency,
    formattedAmountWithoutPoint,
    formattedAmountWithoutPointAndCurrency,
    currency: {
      code: currencyCode,
      exchangeRate: 1,
      symbol: "$",
    },
  };
}
