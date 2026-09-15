import { ref } from "vue";
import { useFetch } from "@/core/api/common";
import { useAnalytics, useAuth } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { globals } from "@/core/globals";
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

const ANALYTICS_LOGIN_METHOD = "otp";
const NATIVE_SIGN_IN_PROVIDER = "OTP";

export function useOtpSignIn() {
  const loading = ref(false);
  const { nativeSignIn, errors: authErrors } = useAuth();
  const { signIn, errors: signInErrors, resetErrors: resetSignInErrors } = useSignMeIn();
  const { analytics } = useAnalytics();

  async function requestCode(email: string): Promise<IOtpRequestResponse | undefined> {
    loading.value = true;

    try {
      const { data } = await useFetch("/api/otp/request")
        .post({ storeId: globals.storeId, email })
        .json<IOtpRequestResponse>();

      return data.value ?? undefined;
    } finally {
      loading.value = false;
    }
  }

  async function verifyCode(email: string, code: string): Promise<IOtpVerifyResponse | undefined> {
    loading.value = true;

    try {
      const { data } = await useFetch("/api/otp/verify")
        .post({ storeId: globals.storeId, email, code })
        .json<IOtpVerifyResponse>();

      const result = data.value ?? undefined;

      if (result?.outcome === "Success") {
        await completeSignIn(email, code);
      }

      return result;
    } finally {
      loading.value = false;
    }
  }

  async function completeSignIn(email: string, code: string): Promise<void> {
    try {
      await nativeSignIn(NATIVE_SIGN_IN_PROVIDER, { storeId: globals.storeId, email, code });
      await signIn();
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      Logger.error(`${useOtpSignIn.name}.${completeSignIn.name}`, e);
      analytics("login", ANALYTICS_LOGIN_METHOD, { success: false, errors: error.message });
      return;
    }

    if (signInErrors.value?.length) {
      analytics("login", ANALYTICS_LOGIN_METHOD, {
        success: false,
        errors: signInErrors.value.map((error) => `${error.code}: ${error.description}`).join(", "),
      });

      if (authErrors.value?.some((error) => error.code === IdentityErrors.SIGN_IN_NOT_ALLOWED)) {
        location.href = "/400";
      }

      return;
    }

    analytics("login", ANALYTICS_LOGIN_METHOD, { success: true });
  }

  return {
    loading,
    requestCode,
    verifyCode,
    signInErrors,
    resetSignInErrors,
  };
}
