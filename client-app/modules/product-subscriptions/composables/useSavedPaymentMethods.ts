import { createSharedComposable } from "@vueuse/core";
import { computed, ref } from "vue";
import { Logger } from "@/core/utilities";
import { getSavedPaymentMethods, removeSavedPaymentMethod, setDefaultSavedPaymentMethod } from "../api/graphql";
import type { SavedPaymentMethodFieldsFragment } from "../api/graphql/types";

function _useSavedPaymentMethods() {
  const methods = ref<SavedPaymentMethodFieldsFragment[]>([]);
  const loading = ref(false);
  const loaded = ref(false);

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
    remove,
    setDefault,
  };
}

export const useSavedPaymentMethods = createSharedComposable(_useSavedPaymentMethods);
