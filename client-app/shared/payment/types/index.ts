export enum PaymentMethodGroupType {
  // Paypal type, redirecting payer to paypal site
  Paypal,

  // Bank card type, information about card is entered on our site
  BankCard,

  // Alternative type, redirecting payer to external payment or using prepared html-form/iframe
  Alternative,

  // Manual payment method type, when user pay out of website by instruction (like Cash on Demand (COD), bank deposit)
  Manual,
}

export enum PaymentActionType {
  Unknown,

  // All payment information is entered on the site
  Standard,

  // A customer is redirected to a third-party site in order to complete the payment
  Redirection,

  // Payment system send prepared html form for request
  PreparedForm,
}

export type BankCardType = {
  cardholderName: string;
  number: string;
  month: string;
  year: string;
  securityCode: string;
};

export type BankCardErrorsType = Partial<BankCardType>;
