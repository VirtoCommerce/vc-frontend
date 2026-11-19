import { createSharedComposable } from "@vueuse/core";
import { computed, readonly, ref } from "vue";
import type { AuthorizePaymentResultType, CustomerOrderType } from "@/core/api/graphql/types";

type PaymentProcessorType = ((order: CustomerOrderType) => Promise<AuthorizePaymentResultType | null>) | null;

function _usePaymentFactory() {
  const paymentProcessorInternal = ref<PaymentProcessorType>(null);
  const isValidCardData = ref(false);
  const isCanFinalizePayment = computed(() => {
    return isValidCardData.value && paymentProcessorInternal.value !== null;
  });

  const setCardDataValid = () => {
    isValidCardData.value = true;
  };

  const setCardDataInvalid = () => {
    isValidCardData.value = false;
  };

  const registerPaymentProcessor = (paymentProcessor: PaymentProcessorType) => {
    paymentProcessorInternal.value = paymentProcessor;
  };

  /**
   * Clears the processor and the card validity, but only while the given processor is still the registered one: by the
   * time a form unmounts, the form that replaced it may already have registered its own.
   */
  const unregisterPaymentProcessor = (paymentProcessor: NonNullable<PaymentProcessorType>) => {
    if (paymentProcessorInternal.value !== paymentProcessor) {
      return;
    }

    paymentProcessorInternal.value = null;
    isValidCardData.value = false;
  };

  const finalizePayment = async (order: CustomerOrderType) => {
    return paymentProcessorInternal.value?.(order);
  };

  return {
    isValidCardData: readonly(isValidCardData),
    setCardDataValid,
    setCardDataInvalid,
    isCanFinalizePayment,
    registerPaymentProcessor,
    unregisterPaymentProcessor,
    finalizePayment,
  };
}

export const usePayment = createSharedComposable(_usePaymentFactory);
