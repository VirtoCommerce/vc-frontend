import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { errorHandler, HttpError, toServerError, useFetch } from "@/core/api/common";
import { useAnalytics, useAuth } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useSignMeIn } from "@/shared/account/composables";
import type { IdentityErrorType } from "@/core/api/graphql/types";

export interface IOtpRequestResponse {
  succeeded: boolean;
  error?: IdentityErrorType;
  maskedEmail?: string;
  lockoutSecondsRemaining?: number;
}

export interface IOtpVerifyResponse {
  succeeded: boolean;
  error?: IdentityErrorType;
  lockoutSecondsRemaining?: number;
}

interface IOtpErrorEmits {
  (event: "disabled"): void;
  (event: "locked", error: IdentityErrorType, lockoutSecondsRemaining: number | undefined): void;
}

const ANALYTICS_LOGIN_METHOD = "otp";

export function useOtpSignIn() {
  const loading = ref(false);
  const { t } = useI18n();
  const { otpSignIn, errors: authErrors, lockoutSecondsRemaining } = useAuth();
  const { signIn, errors: signInErrors, resetErrors: resetSignInErrors } = useSignMeIn();
  const { analytics } = useAnalytics();

  async function requestCode(email: string): Promise<IOtpRequestResponse | undefined> {
    loading.value = true;
    resetSignInErrors();

    try {
      const { data } = await useFetch("/api/otp/request", {
        onFetchError: (context) => {
          if (context.response?.status !== HttpError.BAD_REQUEST) {
            errorHandler(toServerError(context.error, context.response?.status), JSON.stringify(context.error));
          }
          return context;
        },
      })
        .post({ email, storeId: globals.storeId })
        .json<IOtpRequestResponse>();

      return data.value ?? undefined;
    } finally {
      loading.value = false;
    }
  }

  // POST /connect/token with grant_type=otp_email verifies the code and issues the tokens in one call.
  async function verifyCode(email: string, code: string): Promise<IOtpVerifyResponse | undefined> {
    loading.value = true;

    try {
      let tokenExchangeError: unknown;

      try {
        await otpSignIn({ email, code, storeId: globals.storeId });
      } catch (e) {
        // getToken(true) rejects on any non-2xx /connect/token response, but authErrors is
        // already populated from the response body by then - handle it below like any other
        // error outcome, and only treat this as unrecoverable if no structured error came back.
        tokenExchangeError = e;
      }

      const error = authErrors.value?.[0];
      if (error) {
        analytics("login", ANALYTICS_LOGIN_METHOD, { success: false, errors: error.code ?? error.description });
        return { succeeded: false, error, lockoutSecondsRemaining: lockoutSecondsRemaining.value };
      }

      if (tokenExchangeError) {
        throw tokenExchangeError;
      }

      await signIn();

      analytics("login", ANALYTICS_LOGIN_METHOD, { success: true });
      return { succeeded: true };
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      Logger.error(`${useOtpSignIn.name}.${verifyCode.name}`, e);
      analytics("login", ANALYTICS_LOGIN_METHOD, { success: false, errors: error.message });
      return undefined;
    } finally {
      loading.value = false;
    }
  }

  function showError(error?: IdentityErrorType) {
    signInErrors.value = [error ?? { description: t("common.messages.something_went_wrong") }];
  }

  function handleError(result: IOtpRequestResponse | IOtpVerifyResponse | undefined, emit: IOtpErrorEmits) {
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
