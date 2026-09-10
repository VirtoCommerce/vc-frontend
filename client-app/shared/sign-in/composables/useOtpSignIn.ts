import { ref } from "vue";
import { useFetch } from "@/core/api/common";
import { useAnalytics, useAuth } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useSignMeIn } from "@/shared/account/composables";

export type OtpRequestOutcomeType = "Sent" | "Disabled";
export type OtpVerifyOutcomeType = "Success" | "InvalidCode" | "Disabled" | "Locked";

export interface IOtpRequestResponse {
  outcome: OtpRequestOutcomeType;
  maskedEmail?: string;
}

export interface IOtpVerifyResponse {
  outcome: OtpVerifyOutcomeType;
  lockoutSecondsRemaining?: number;
}

const ANALYTICS_LOGIN_METHOD = "otp";

export function useOtpSignIn() {
  const loading = ref(false);
  const { externalSignInCallback, errors: authErrors } = useAuth();
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
        await completeSignIn();
      }

      return result;
    } finally {
      loading.value = false;
    }
  }

  async function completeSignIn(): Promise<void> {
    try {
      await externalSignInCallback();
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
