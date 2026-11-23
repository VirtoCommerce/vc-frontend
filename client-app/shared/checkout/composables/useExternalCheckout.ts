import { createGlobalState } from "@vueuse/core";
import { computed, readonly, shallowRef } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";
import type { MaybeRefOrGetter } from "vue";

export type CheckoutSectionType = "shipping" | "payment" | "comment";

/** Per section, whether the checkout still shows it. A section left out keeps the store's default. */
export type ExternalCheckoutSectionsType = Partial<Record<CheckoutSectionType, MaybeRefOrGetter<boolean>>>;

/**
 * Whether the order is placed outside the store (e.g. a punchout requisition): a module has taken over
 * the place-order step. Cart actions that end in a store order or quote have no place then, and the
 * module decides which checkout sections are still needed.
 */
function _useExternalCheckout() {
  const { canRender } = useExtensionRegistry();

  const sections = shallowRef<ExternalCheckoutSectionsType>({});

  const isExternalCheckout = computed(() => canRender("checkout", EXTENSION_NAMES.checkout.placeOrder, undefined));

  function setSections(value: ExternalCheckoutSectionsType) {
    sections.value = value;
  }

  return {
    isExternalCheckout,
    sections: readonly(sections),
    setSections,
  };
}

export const useExternalCheckout = createGlobalState(_useExternalCheckout);
