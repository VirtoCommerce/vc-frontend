import type {
  AuthorizePaymentResultType,
  CartType,
  CustomerOrderType,
  InitializeCartPaymentResultType,
  InitializePaymentResultType,
  InputAuthorizePaymentType,
  InputInitializeCartPaymentType,
  InputInitializePaymentType,
  PaymentType,
} from "@/core/api/graphql/types";
import type { Ref } from "vue";

export interface IPaymentMethodExpose {
  authorizeCurrentPaymentWithOrder?: (
    payload?: Partial<InputAuthorizePaymentType>,
    order?: CustomerOrderType,
  ) => Promise<unknown>;
  executeCurrentNativePayment?: (
    payload?: Partial<InputInitializePaymentType>,
    order?: CustomerOrderType,
  ) => Promise<void>;
  initializeCurrentPayment?: () => Promise<void>;
  loading?: Ref<boolean, boolean>;
  initialized?: Ref<boolean, boolean>;
}

export interface IPaymentMethodParameters {
  hidePaymentButton?: boolean;
  order?: CustomerOrderType;
  payment?: PaymentType; // can it be PaymentInType?
  cart?: CartType;
  disabled?: boolean;
  initPayment?:
    | ((payload?: Partial<InputInitializePaymentType>) => Promise<InitializePaymentResultType>)
    | ((payload?: Partial<InputInitializeCartPaymentType>) => Promise<InitializeCartPaymentResultType>);
  authorizePayment?: (payload?: Partial<InputAuthorizePaymentType>) => Promise<AuthorizePaymentResultType>;
}
