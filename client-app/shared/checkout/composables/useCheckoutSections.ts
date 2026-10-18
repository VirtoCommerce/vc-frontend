import { computed, toValue } from "vue";
import { useThemeContext } from "@/core/composables";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "./useCheckout";
import { useExternalCheckout } from "./useExternalCheckout";
import type { CheckoutSectionType } from "./useExternalCheckout";

/** Which checkout sections are shown, and whether a shown one still misses required data. */
export function useCheckoutSections() {
  const { themeContext } = useThemeContext();
  const { isExternalCheckout, sections } = useExternalCheckout();
  const { allItemsAreDigital } = useFullCart();
  const { isValidShipment, isValidPayment } = useCheckout();

  function isVisible(section: CheckoutSectionType): boolean {
    return !isExternalCheckout.value || toValue(sections.value[section] ?? true);
  }

  // An external checkout leaves the store from the cart, so there are no further steps to go to
  const isSinglePageCheckout = computed(
    () => !themeContext.value?.settings?.checkout_multistep_enabled || isExternalCheckout.value,
  );

  const isShippingSectionVisible = computed(() => !allItemsAreDigital.value && isVisible("shipping"));
  const isPaymentSectionVisible = computed(() => isVisible("payment"));
  const isCommentSectionVisible = computed(
    () => !!themeContext.value?.settings?.checkout_comment_enabled && isVisible("comment"),
  );

  // A hidden section is someone else's part, so only the shown ones have to be complete
  const hasIncompleteSections = computed(
    () =>
      (isShippingSectionVisible.value && !isValidShipment.value) ||
      (isPaymentSectionVisible.value && !isValidPayment.value),
  );

  return {
    isSinglePageCheckout,
    isShippingSectionVisible,
    isPaymentSectionVisible,
    isCommentSectionVisible,
    hasIncompleteSections,
  };
}
