export enum IdentityErrors {
  LOGIN_FAILED = "login_failed",
  EMAIL_VERIFICATION_REQUIRED = "email_verification_is_required",
  USER_IS_TEMPORARY_LOCKED_OUT = "user_is_temporary_locked_out",
  USER_IS_LOCKED_OUT = "user_is_locked_out",
  USER_CANNOT_LOGIN_IN_STORE = "user_cannot_login_in_store",
  USER_NOT_FOUND = "user_not_found",
  PASSWORD_EXPIRED = "password_expired",
  SIGN_IN_NOT_ALLOWED = "sign_in_not_allowed",
}
