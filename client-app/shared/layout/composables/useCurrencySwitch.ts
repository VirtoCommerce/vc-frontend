import { useMutation } from "@vue/apollo-composable";
import { ChangeCartCurrencyDocument } from "@/core/api/graphql/types";
import { useCurrency } from "@/core/composables/useCurrency";
import { globals } from "@/core/globals";
import { useBroadcast } from "@/shared/broadcast/composables/useBroadcast";
import { dataChangedEvent } from "@/shared/broadcast/utils/events";
import { useShortCart } from "@/shared/cart/composables/useCart";

export function useCurrencySwitch() {
  const { currentCurrency, supportedCurrencies, saveCurrencyCode } = useCurrency();
  const { cart } = useShortCart();
  const { mutate: changeCartCurrency } = useMutation(ChangeCartCurrencyDocument);
  const broadcast = useBroadcast();
  const { userId, storeId, cultureName, currencyCode: currentCurrencyCode } = globals;

  // Re-prices the cart before the page reloads in the new currency, and tells the other tabs.
  async function selectCurrency(code: string): Promise<void> {
    if (currentCurrency.value?.code === code) {
      return;
    }

    if (cart.value) {
      await changeCartCurrency({
        command: {
          userId,
          cartId: cart.value.id,
          newCurrencyCode: code,
          storeId,
          cultureName,
          currencyCode: currentCurrencyCode,
        },
      });
    }

    void broadcast.emit(dataChangedEvent);

    saveCurrencyCode(code);
  }

  return {
    currentCurrency,
    supportedCurrencies,
    selectCurrency,
  };
}
