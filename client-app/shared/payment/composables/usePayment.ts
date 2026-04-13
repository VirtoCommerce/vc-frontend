import { createSharedComposable } from "@vueuse/core";
import { computed, readonly, ref } from "vue";
import { useAnalytics } from "@/core/composables/useAnalytics";
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

  const finalizePayment = async (order: CustomerOrderType) => {
    return paymentProcessorInternal.value?.(order);
  };

  function onPurchaseCompleted(order: CustomerOrderType) {
    const { analytics } = useAnalytics();
    analytics("purchase", order);
  }

  return {
    isValidCardData: readonly(isValidCardData),
    setCardDataValid,
    setCardDataInvalid,
    isCanFinalizePayment,
    registerPaymentProcessor,
    finalizePayment,
    onPurchaseCompleted,
  };
}

export const usePayment = createSharedComposable(_usePaymentFactory);
