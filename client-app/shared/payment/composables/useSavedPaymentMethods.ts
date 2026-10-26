import { createSharedComposable } from "@vueuse/core";
import { computed, ref } from "vue";
import { Logger } from "@/core/utilities";
import { getSavedPaymentMethods, removeSavedPaymentMethod, setDefaultSavedPaymentMethod } from "../api/graphql";
import type { SavedPaymentMethodFieldsFragment } from "../api/graphql/types";

/** The signed-in customer's saved cards (x-cart), shared by the card forms and the account's payment methods page. */
function _useSavedPaymentMethods() {
  const methods = ref<SavedPaymentMethodFieldsFragment[]>([]);
  const loading = ref(false);
  const loaded = ref(false);

  /** Cards that can pay: active and not expired. */
  const activeMethods = computed(() => methods.value.filter((x) => x.status === "Active" && !x.isExpired));
  const defaultMethod = computed(() => activeMethods.value.find((x) => x.isDefault) ?? activeMethods.value[0]);

  async function fetch(): Promise<void> {
    loading.value = true;
    try {
      methods.value = (await getSavedPaymentMethods()) ?? [];
      loaded.value = true;
    } catch (e) {
      Logger.error(`${_useSavedPaymentMethods.name}.${fetch.name}`, e);
    } finally {
      loading.value = false;
    }
  }

  /** Active cards of one payment method: a card can only pay through the payment method that saved it. */
  function methodsFor(paymentMethodCode: string): SavedPaymentMethodFieldsFragment[] {
    return activeMethods.value.filter((x) => x.paymentMethodCode === paymentMethodCode);
  }

  async function remove(id: string): Promise<void> {
    await removeSavedPaymentMethod({ id });
    await fetch();
  }

  async function setDefault(id: string): Promise<void> {
    await setDefaultSavedPaymentMethod({ id });
    await fetch();
  }

  return {
    methods,
    activeMethods,
    defaultMethod,
    loading,
    loaded,
    fetch,
    methodsFor,
    remove,
    setDefault,
  };
}

export const useSavedPaymentMethods = createSharedComposable(_useSavedPaymentMethods);
