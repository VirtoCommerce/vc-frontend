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
};
