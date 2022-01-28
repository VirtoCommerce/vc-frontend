import { useUser } from ".";
import { CheckoutDefaults } from "./../types/index";
export default () => {
  const { me } = useUser();
  const keyPrefix = "checkout_defaults_";

  function setUserCheckoutDefaults(defaults: CheckoutDefaults) {
    localStorage.setItem(`${keyPrefix}${me.value.id}`, JSON.stringify(defaults));
  }

  function getUserCheckoutDefaults(): CheckoutDefaults | null {
    const value = localStorage.getItem(`${keyPrefix}${me.value.id}`);
    return value == null ? null : (JSON.parse(value) as CheckoutDefaults);
  }

  return {
    setUserCheckoutDefaults,
    getUserCheckoutDefaults,
  };
};
