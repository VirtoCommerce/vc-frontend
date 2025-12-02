import type { CartType, CustomerOrderType, PaymentType } from "@/core/api/graphql/types";

export interface IPaymentMethodParameters {
  hidePaymentButton?: boolean;
  payment?: PaymentType;
  disabled?: boolean;

  cart?: CartType;
  order?: CustomerOrderType;
}

export interface IPaymentMethodEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}
