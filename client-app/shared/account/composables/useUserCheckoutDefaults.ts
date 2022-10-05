import { useUser } from ".";
import { CheckoutDefaults } from "./../types/index";
import { Logger } from "@/core/utilities";
import { PaymentMethodType, ShippingMethodType } from "@/xapi/types";

export default function useUserCheckoutDefaults() {
  const { user } = useUser();
  const keyPrefix = "checkout_defaults_";

  function setUserCheckoutDefaults(defaults: CheckoutDefaults) {
    localStorage.setItem(`${keyPrefix}${user.value.id}`, JSON.stringify(defaults));
  }

  /**
   * Migration to another data type
   * @deprecated
   * @todo Remove in the first quarter of 2023
   */
  function migration(
    defaults:
      | (CheckoutDefaults & /* deprecated type */ {
          shippingMethod?: ShippingMethodType;
          paymentMethod?: PaymentMethodType;
        })
      | null
  ): CheckoutDefaults | null {
    const { shippingMethod, paymentMethod, deliveryMethod } = defaults || {};

    if (!shippingMethod && !paymentMethod) {
      return defaults;
    }

    const newDefaults: CheckoutDefaults = {
      deliveryMethod,
      shippingMethodId: shippingMethod?.id,
      paymentMethodCode: paymentMethod?.code,
    };

    setUserCheckoutDefaults(newDefaults);

    return newDefaults;
  }

  function getUserCheckoutDefaults(): CheckoutDefaults | null {
    let result: CheckoutDefaults | null = null;

    const value = localStorage.getItem(`${keyPrefix}${user.value.id}`);

    if (value) {
      try {
        result = JSON.parse(value);
      } catch (e) {
        Logger.error(`${useUserCheckoutDefaults.name}.${getUserCheckoutDefaults.name}`, e);
      }
    }

    return migration(result);
  }

  return {
    setUserCheckoutDefaults,
    getUserCheckoutDefaults,
  };
}
