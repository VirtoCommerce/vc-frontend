import { ref } from "vue";
import { useFetch } from "@/core/api/common";
import { useAnalytics, useAuth } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { Logger } from "@/core/utilities";
import { useSignMeIn } from "@/shared/account/composables";

export type OtpRequestOutcomeType = "CodeSent" | "OtpDisabled";
export type OtpVerifyOutcomeType = "Success" | "InvalidCode" | "OtpDisabled" | "AccountLocked";

export interface IOtpRequestResponse {
  outcome: OtpRequestOutcomeType;
  maskedEmail?: string;
}

export interface IOtpVerifyResponse {
  outcome: OtpVerifyOutcomeType;
  lockoutSecondsRemaining?: number;
}

// Error codes OtpEmailTokenGrantHandler returns from POST /connect/token (grant_type=otp_email) on failure.
const OTP_ERROR_CODE_ACCOUNT_LOCKED = "account_locked";
const OTP_ERROR_CODE_OTP_DISABLED = "otp_disabled";

const ANALYTICS_LOGIN_METHOD = "otp";

export function useOtpSignIn() {
  const loading = ref(false);
  const { nativeSignIn, errors: authErrors, lockoutSecondsRemaining } = useAuth();
  const { signIn, errors: signInErrors, resetErrors: resetSignInErrors } = useSignMeIn();
  const { analytics } = useAnalytics();

  async function requestCode(email: string): Promise<IOtpRequestResponse | undefined> {
    loading.value = true;

    try {
      const { data } = await useFetch("/api/otp/request").post({ email }).json<IOtpRequestResponse>();

      return data.value ?? undefined;
    } finally {
      loading.value = false;
    }
  }

  // Verifying and completing sign-in both happen in the same POST /connect/token call - it's the
  // one place that already has to check the code, so it reports the detailed outcome directly
  // instead of a separate, purely-informational /api/otp/verify call duplicating that check.
  async function verifyCode(email: string, code: string): Promise<IOtpVerifyResponse | undefined> {
    loading.value = true;

    try {
      let tokenExchangeError: unknown;

      try {
        await nativeSignIn({ email, code });
      } catch (e) {
        // getToken(true) rejects on any non-2xx /connect/token response, but authErrors is
        // already populated from the response body by then - handle it below like any other
        // error outcome, and only treat this as unrecoverable if no structured error came back.
        tokenExchangeError = e;
      }

      const errorCode = authErrors.value?.[0]?.code;
      if (errorCode) {
        analytics("login", ANALYTICS_LOGIN_METHOD, { success: false, errors: errorCode });

        if (errorCode === OTP_ERROR_CODE_ACCOUNT_LOCKED) {
          return { outcome: "AccountLocked", lockoutSecondsRemaining: lockoutSecondsRemaining.value };
        }
        if (errorCode === OTP_ERROR_CODE_OTP_DISABLED) {
          return { outcome: "OtpDisabled" };
        }
        if (authErrors.value?.some((error) => error.code === IdentityErrors.SIGN_IN_NOT_ALLOWED)) {
          location.href = "/400";
        }
        return { outcome: "InvalidCode" };
      }

      if (tokenExchangeError) {
        throw tokenExchangeError;
      }

      await signIn();

      analytics("login", ANALYTICS_LOGIN_METHOD, { success: true });
      return { outcome: "Success" };
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      Logger.error(`${useOtpSignIn.name}.${verifyCode.name}`, e);
      analytics("login", ANALYTICS_LOGIN_METHOD, { success: false, errors: error.message });
      return undefined;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    requestCode,
    verifyCode,
    signInErrors,
    resetSignInErrors,
  };
}
