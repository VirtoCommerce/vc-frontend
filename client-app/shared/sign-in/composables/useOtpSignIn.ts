import { ref } from "vue";
import { useFetch } from "@/core/api/common";
import { useAuth } from "@/core/composables";
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

export function useOtpSignIn() {
  const loading = ref(false);
  const { externalSignInCallback } = useAuth();
  const { signIn } = useSignMeIn();

  async function requestCode(email: string): Promise<IOtpRequestResponse | undefined> {
    loading.value = true;

    try {
      const { data } = await useFetch("/api/otp/request")
        .post({ storeId: globals.storeId, email })
        .json<IOtpRequestResponse>();

      return data.value ?? undefined;
    } catch (e) {
      Logger.error(`${useOtpSignIn.name}.${requestCode.name}`, e);
      throw e;
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
        await externalSignInCallback();
        await signIn();
      }

      return result;
    } catch (e) {
      Logger.error(`${useOtpSignIn.name}.${verifyCode.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    requestCode,
    verifyCode,
  };
}
