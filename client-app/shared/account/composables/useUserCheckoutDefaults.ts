import { Logger } from "@/core/utilities";
import { useUser } from "./useUser";
import type { CheckoutDefaultsType } from "@/shared/account";

export function useUserCheckoutDefaults() {
  const { user } = useUser();
  const keyPrefix = "checkout_defaults_";

  function setUserCheckoutDefaults(defaults: CheckoutDefaultsType) {
    localStorage.setItem(`${keyPrefix}${user.value.id}`, JSON.stringify(defaults));
  }

  function getUserCheckoutDefaults(): CheckoutDefaultsType {
    let result: CheckoutDefaultsType | null = null;

    const value = localStorage.getItem(`${keyPrefix}${user.value.id}`);

    if (value) {
      try {
        const data = JSON.parse(value) as unknown;
        if (data && typeof data === "object") {
          result = JSON.parse(value) as CheckoutDefaultsType;
        }
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
