import { PaymentMethodType, ShippingMethodType } from "@core/api/graphql/types";

export type SignMeUp = {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
};

export type SignMeIn = {
  userName: string;
  password: string;
  rememberMe?: boolean;
};

export type ForgotPassword = {
  email: string;
  resetPasswordUrl: string;
};

export type ValidateToken = {
  userId: string;
  token: string;
};

export type ResetPassword = {
  userId: string;
  token: string;
  password: string;
};

export interface ISortInfo {
  column: string;
  direction: string;
}

export type CheckoutDefaults = {
  deliveryMethod?: string;
  shippingMethod?: ShippingMethodType;
  paymentMethod?: PaymentMethodType;
};

export type UserPersonalData = {
  firstName: string;
  lastName: string;
};
