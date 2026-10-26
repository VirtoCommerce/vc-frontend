export type TwoFactorProviderType = {
  name: string;
  destination?: string;
};

export type TwoFactorChallengeType = {
  twoFactorToken: string;
  provider?: string;
  providers?: Array<TwoFactorProviderType>;
  resendSecondsRemaining?: number;
};

type IdentityErrorType = {
  code?: string;
  description?: string;
};

export type ConnectTokenResponseType = {
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  errors?: Array<IdentityErrorType>;
  error?: string;
  token_type?: string;
  lockoutSecondsRemaining?: number;
} & Partial<TwoFactorChallengeType>;
