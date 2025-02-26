export enum RegistrationKind {
  personal = "personal",
  organization = "organization",
}

export type RegisterOrganizationType = {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  organizationName?: string;
};

export type SignMeUpType = {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type ForgotPasswordType = {
  email: string;
  resetPasswordUrlPath: string;
};

export type ResetPasswordType = {
  userId: string;
  token: string;
  password: string;
};

export type ChangePasswordType = {
  userId: string;
  oldPassword: string;
  newPassword: string;
};

export type CheckoutDefaultsType = {
  deliveryMethod?: string;
  shippingMethodId?: string;
  paymentMethodCode?: string;
};

export type UserPersonalDataType = {
  firstName: string;
  lastName: string;
  defaultLanguage?: string;
  currencyCode?: string;
};

export type OrdersFilterDataType = {
  statuses: string[];
  startDate?: string;
  endDate?: string;
  customerNames?: string[];
};

export type OrdersFilterChipsItemType = {
  fieldName: keyof OrdersFilterDataType;
  value?: string;
  label: string;
};

export type OrderScopeType = "private" | "organization";
