import { useAuth } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { globals } from "@/core/globals";
import { useCodeSignIn } from "./useCodeSignIn";
import type { ICodeSignInResponse } from "./useCodeSignIn";
import type { IdentityErrorType } from "@/core/api/graphql/types";

export interface IOtpRequestResponse extends ICodeSignInResponse {
  maskedEmail?: string;
}

interface IOtpErrorEmits {
  (event: "disabled"): void;
  (event: "locked", error: IdentityErrorType, lockoutSecondsRemaining: number | undefined): void;
}

const ANALYTICS_LOGIN_METHOD = "otp";

export function useOtpSignIn() {
  const { otpSignIn } = useAuth();
  const { loading, signInErrors, resetSignInErrors, signIn, sendCode, exchangeCode, showError } =
    useCodeSignIn(ANALYTICS_LOGIN_METHOD);

  function requestCode(email: string): Promise<IOtpRequestResponse | undefined> {
    return sendCode<IOtpRequestResponse>("/api/otp/request", { email, storeId: globals.storeId });
  }

  // POST /connect/token with grant_type=otp_email verifies the code and issues the tokens in one call.
  function verifyCode(email: string, code: string): Promise<ICodeSignInResponse | undefined> {
    return exchangeCode(() => otpSignIn({ email, code, storeId: globals.storeId }), { onExchanged: signIn });
  }

  function handleError(result: ICodeSignInResponse | undefined, emit: IOtpErrorEmits) {
    switch (result?.error?.code) {
      case IdentityErrors.OTP_DISABLED:
        emit("disabled");
        break;
      case IdentityErrors.USER_IS_LOCKED_OUT:
      case IdentityErrors.USER_IS_TEMPORARY_LOCKED_OUT:
        emit("locked", result.error, result.lockoutSecondsRemaining);
        break;
      default:
        showError(result?.error);
    }
  }

  return {
    loading,
    requestCode,
    verifyCode,
    signInErrors,
    resetSignInErrors,
    handleError,
  };
}
