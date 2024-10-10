import { Logger } from "@/core/utilities";
import { useUser } from "./useUser";
import type { CheckoutDefaults } from "@/shared/account";

export function useUserCheckoutDefaults() {
  const { user } = useUser();
  const keyPrefix = "checkout_defaults_";

  function setUserCheckoutDefaults(defaults: CheckoutDefaults) {
    localStorage.setItem(`${keyPrefix}${user.value.id}`, JSON.stringify(defaults));
  }

  function getUserCheckoutDefaults(): CheckoutDefaults {
    let result: CheckoutDefaults | null = null;

    const value = localStorage.getItem(`${keyPrefix}${user.value.id}`);

    if (value) {
      try {
        result = JSON.parse(value) as CheckoutDefaults;
      } catch (e) {
        Logger.error(`${useUserCheckoutDefaults.name}.${getUserCheckoutDefaults.name}`, e);
      }
    }

    return result ?? {};
  }

  return {
    setUserCheckoutDefaults,
    getUserCheckoutDefaults,
  };
}
