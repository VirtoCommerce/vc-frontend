import { createSharedComposable } from "@vueuse/core";
import type { AuthorizePaymentResultType, CustomerOrderType } from "@/core/api/graphql/types";

type PaymentProcessorType = ((order: CustomerOrderType) => Promise<AuthorizePaymentResultType | null>) | null;

function _usePaymentFactory() {
  let paymentProcessorInternal: PaymentProcessorType = null;

  const registerPaymentProcessor = (paymentProcessor: PaymentProcessorType) => {
    paymentProcessorInternal = paymentProcessor;
  };

  const finalizePayment = async (order: CustomerOrderType) => {
    return paymentProcessorInternal?.(order);
  };

  return {
    registerPaymentProcessor,
    finalizePayment,
  };
}

export const usePayment = createSharedComposable(_usePaymentFactory);
