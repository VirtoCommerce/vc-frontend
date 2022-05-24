import { useUser } from ".";
import { CheckoutDefaults } from "./../types/index";
import { Logger } from "@core/utilities";

export default () => {
  const { me } = useUser();
  const keyPrefix = "checkout_defaults_";

  function setUserCheckoutDefaults(defaults: CheckoutDefaults) {
    localStorage.setItem(`${keyPrefix}${me.value!.id}`, JSON.stringify(defaults));
  }

  function getUserCheckoutDefaults(): CheckoutDefaults | null {
    let result: CheckoutDefaults | null = null;

    const value = localStorage.getItem(`${keyPrefix}${me.value!.id}`);

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
