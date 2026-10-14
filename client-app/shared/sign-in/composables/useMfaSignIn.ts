import { useAuth } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { globals } from "@/core/globals";
import { useCodeSignIn } from "./useCodeSignIn";
import type { ICodeSignInResponse } from "./useCodeSignIn";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { ConnectTokenResponseType } from "@/core/types";

export type MfaResendResponseType = ICodeSignInResponse &
  Pick<ConnectTokenResponseType, "twoFactorToken" | "provider" | "providers" | "resendSecondsRemaining">;

interface IMfaErrorEmits {
  (event: "failed", error: IdentityErrorType): void;
}

interface IVerifyCodeOptions {
  onVerified: () => Promise<unknown>;
  trackAnalytics?: boolean;
}

const ANALYTICS_LOGIN_METHOD = "password";

const FINAL_ERRORS: string[] = [
  IdentityErrors.INVALID_TWO_FACTOR_TOKEN,
  IdentityErrors.USER_IS_LOCKED_OUT,
  IdentityErrors.USER_IS_TEMPORARY_LOCKED_OUT,
  IdentityErrors.SIGN_IN_NOT_ALLOWED,
  IdentityErrors.LOCKOUT_DISABLED,
  IdentityErrors.MFA_PROVIDER_NOT_AVAILABLE,
  IdentityErrors.CODE_ATTEMPTS_EXCEEDED,
  IdentityErrors.LOGIN_FAILED,
];

export function useMfaSignIn() {
  const { mfaSignIn } = useAuth();
  const { loading, signInErrors, resetSignInErrors, sendCode, exchangeCode, showError } =
    useCodeSignIn(ANALYTICS_LOGIN_METHOD);

  function resendCode(twoFactorToken: string, provider?: string): Promise<MfaResendResponseType | undefined> {
    return sendCode<MfaResendResponseType>("/api/mfa/resend", { twoFactorToken, provider });
  }

  function verifyCode(
    email: string,
    twoFactorToken: string,
    code: string,
    { onVerified, trackAnalytics }: IVerifyCodeOptions,
  ): Promise<ICodeSignInResponse | undefined> {
    return exchangeCode(() => mfaSignIn({ email, twoFactorToken, code, storeId: globals.storeId }), {
      onExchanged: onVerified,
      trackAnalytics,
    });
  }

  function handleError(result: ICodeSignInResponse | undefined, emit: IMfaErrorEmits) {
    const error = result?.error;

    if (error && (result.tokensDiscarded || (error.code && FINAL_ERRORS.includes(error.code)))) {
      emit("failed", error);
      return;
    }

    showError(error);
  }

  return {
    loading,
    resendCode,
    verifyCode,
    signInErrors,
    resetSignInErrors,
    handleError,
  };
}
