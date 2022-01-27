import { useUser } from ".";
import { CheckoutDefaults } from "./../types/index";
export default () => {
  const { me } = useUser();

  function setUserCheckoutDefaults(defaults: CheckoutDefaults) {
    localStorage.setItem(me.value.id, JSON.stringify(defaults));
  }

  function getUserCheckoutDefaults(): CheckoutDefaults | null {
    const value = localStorage.getItem(`${me.value.id}`);
    return value == null ? null : (JSON.parse(value) as CheckoutDefaults);
  }

  return {
    setUserCheckoutDefaults,
    getUserCheckoutDefaults,
  };
};
