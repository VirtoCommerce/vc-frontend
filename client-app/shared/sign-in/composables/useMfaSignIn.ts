import { useAuth } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { globals } from "@/core/globals";
import { useCodeSignIn } from "./useCodeSignIn";
import type { ICodeSignInResponse } from "./useCodeSignIn";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { ConnectTokenResponseType } from "@/core/types";

export type MfaResendResponseType = ICodeSignInResponse &
  Pick<ConnectTokenResponseType, "twoFactorToken" | "provider" | "providers" | "resendSecondsRemaining">;

type MfaFailedEmitType = (event: "failed", error: IdentityErrorType) => void;

interface IVerifyCodeOptions {
  onVerified: () => Promise<unknown>;
  trackAnalytics?: boolean;
}

const ANALYTICS_LOGIN_METHOD = "password";

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

  function handleError(result: ICodeSignInResponse | undefined, emit: MfaFailedEmitType) {
    const error = result?.error;
    const isWrongCode = error?.code === IdentityErrors.INVALID_CODE;

    if (error && (result.tokensDiscarded || (error.code && !isWrongCode))) {
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
