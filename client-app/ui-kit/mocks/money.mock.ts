export function getMoney(amount: number, culture = "en-US", currencyCode = "USD"): VcMoneyType {
  const currencyFormat = new Intl.NumberFormat(culture, { currency: currencyCode, style: "currency" });

  return {
    amount,
    formattedAmount: currencyFormat.format(amount),
    formattedAmountWithoutCurrency: new Intl.NumberFormat(culture).format(amount),
    currency: {
      symbol: currencyFormat.formatToParts().find((part) => part.type === "currency")?.value || "",
    },
  };
}
