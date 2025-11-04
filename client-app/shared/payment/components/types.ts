import type { Ref } from "vue";

export interface IPaymentMethodExpose {
  authorizePayment: (opaqueData: Accept.OpaqueData) => Promise<void>;
  initializePayment: () => Promise<void>;
  loading: Ref<boolean, boolean>;
  initialized: Ref<boolean, boolean>;
  isValidBankCard: Ref<boolean, boolean>;
}
