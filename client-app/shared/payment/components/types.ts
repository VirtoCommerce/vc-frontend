import type {
  CartType,
  CustomerOrderType,
  InitializeCartPaymentResultType,
  InitializePaymentResultType,
  InputInitializeCartPaymentType,
  InputInitializePaymentType,
  PaymentType,
} from "@/core/api/graphql/types";

export interface IPaymentMethodParameters {
  hidePaymentButton?: boolean;
  order?: CustomerOrderType;
  payment?: PaymentType; // can it be PaymentInType?
  cart?: CartType;
  disabled?: boolean;
  initPayment?:
    | ((payload?: Partial<InputInitializePaymentType>) => Promise<InitializePaymentResultType>)
    | ((payload?: Partial<InputInitializeCartPaymentType>) => Promise<InitializeCartPaymentResultType>);
}
