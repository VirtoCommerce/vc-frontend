export enum RegistrationKind {
  personal = "personal",
  organization = "organization",
}

export type RegisterOrganization = {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  organizationName?: string;
};

export type SignMeUp = {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type SignMeIn = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type ForgotPassword = {
  email: string;
  resetPasswordUrlPath: string;
};

export type ResetPassword = {
  userId: string;
  token: string;
  password: string;
};

export type ChangePassword = {
  userId: string;
  oldPassword: string;
  newPassword: string;
};

export type CheckoutDefaults = {
  deliveryMethod?: string;
  shippingMethodId?: string;
  paymentMethodCode?: string;
};

export type UserPersonalData = {
  firstName: string;
  lastName: string;
  defaultLanguage?: string;
  currencyCode?: string;
};

export type OrdersFilterData = {
  statuses: string[];
  startDate?: string;
  endDate?: string;
};

export type OrdersFilterChipsItem = {
  fieldName: keyof OrdersFilterData;
  value?: string;
  label: string;
};
