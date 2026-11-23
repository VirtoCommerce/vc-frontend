export enum SignInMode {
  Password = "password",
  Otp = "otp",
}

export enum PasswordStep {
  Password = "password",
  TwoFactor = "two-factor",
}

export enum OtpStep {
  Request = "request",
  Verify = "verify",
  Locked = "locked",
  Disabled = "disabled",
}
