import { createGlobalState } from "@vueuse/core";
import { readonly, ref } from "vue";

// Global, because the cart renders the "Create requisition" button twice (order summary and sticky bar)
function _usePunchoutRequisition() {
  const isSubmitting = ref(false);

  function setSubmitting(value: boolean) {
    isSubmitting.value = value;
  }

  return {
    isSubmitting: readonly(isSubmitting),
    setSubmitting,
  };
}

export const usePunchoutRequisition = createGlobalState(_usePunchoutRequisition);
