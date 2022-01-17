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
