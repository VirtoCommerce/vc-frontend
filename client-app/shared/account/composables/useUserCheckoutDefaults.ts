import { useUser } from ".";
import { CheckoutDefaults } from "./../types/index";
import { Logger } from "@core/utilities";

export default () => {
  const { user } = useUser();
  const keyPrefix = "checkout_defaults_";

  function setUserCheckoutDefaults(defaults: CheckoutDefaults) {
    localStorage.setItem(`${keyPrefix}${user.value.id}`, JSON.stringify(defaults));
  }

  function getUserCheckoutDefaults(): CheckoutDefaults | null {
    let result: CheckoutDefaults | null = null;

    const value = localStorage.getItem(`${keyPrefix}${user.value.id}`);

    if (value) {
      try {
        result = JSON.parse(value) as CheckoutDefaults;
      } catch (e) {
        Logger.error("useUserCheckoutDefaults.getUserCheckoutDefaults", e);
      }
    }

    return result;
  }

  return {
    setUserCheckoutDefaults,
    getUserCheckoutDefaults,
  };
};
