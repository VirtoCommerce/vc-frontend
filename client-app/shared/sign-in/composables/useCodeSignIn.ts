import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { errorHandler, HttpError, toServerError, useFetch } from "@/core/api/common";
import { useAnalytics, useAuth } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { useSignMeIn } from "@/shared/account/composables";
import type { IdentityErrorType } from "@/core/api/graphql/types";

export interface ICodeSignInResponse {
  succeeded: boolean;
  error?: IdentityErrorType;
  lockoutSecondsRemaining?: number;
  tokensDiscarded?: boolean;
}

interface IExchangeCodeOptions {
  onExchanged: () => Promise<unknown>;
  trackAnalytics?: boolean;
}

export function useCodeSignIn(loginMethod: string) {
  const loading = ref(false);
  const { t } = useI18n();
  const { errors: authErrors, lockoutSecondsRemaining, revokeTokens } = useAuth();
  const { signIn, errors: signInErrors, resetErrors: resetSignInErrors } = useSignMeIn();
  const { analytics } = useAnalytics();

  async function sendCode<TResponse extends ICodeSignInResponse>(
    url: string,
    body: Record<string, unknown>,
  ): Promise<TResponse | undefined> {
    loading.value = true;
    resetSignInErrors();

    try {
      const { data } = await useFetch(url, {
        onFetchError: (context) => {
          if (context.response?.status !== HttpError.BAD_REQUEST) {
            errorHandler(toServerError(context.error, context.response?.status), JSON.stringify(context.error));
          }
          return context;
        },
      })
        .post(body)
        .json<TResponse>();

      return data.value ?? undefined;
    } finally {
      loading.value = false;
    }
  }

  async function exchangeCode(
    exchange: () => Promise<void>,
    { onExchanged, trackAnalytics = true }: IExchangeCodeOptions,
  ): Promise<ICodeSignInResponse | undefined> {
    loading.value = true;

    function track(success: boolean, errors?: string) {
      if (trackAnalytics) {
        analytics("login", loginMethod, success ? { success } : { success, errors });
      }
    }

    try {
      let tokenExchangeError: unknown;

      try {
        await exchange();
      } catch (e) {
        // getToken(true) rejects on any non-2xx /connect/token response, but authErrors is
        // already populated from the response body by then - handle it below like any other
        // error outcome, and only treat this as unrecoverable if no structured error came back.
        tokenExchangeError = e;
      }

      const error = authErrors.value?.[0];
      if (error) {
        track(false, error.code ?? error.description);
        return { succeeded: false, error, lockoutSecondsRemaining: lockoutSecondsRemaining.value };
      }

      if (tokenExchangeError) {
        throw tokenExchangeError;
      }

      try {
        await onExchanged();
      } catch (e) {
        await revokeTokens();
        Logger.error(`${useCodeSignIn.name}.${exchangeCode.name}`, e);
        track(false, e instanceof Error ? e.message : String(e));
        return { succeeded: false, error: getGenericError(), tokensDiscarded: true };
      }

      track(true);
      return { succeeded: true };
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      Logger.error(`${useCodeSignIn.name}.${exchangeCode.name}`, e);
      track(false, error.message);
      return undefined;
    } finally {
      loading.value = false;
    }
  }

  function getGenericError(): IdentityErrorType {
    return { description: t("common.messages.something_went_wrong") };
  }

  function showError(error?: IdentityErrorType) {
    signInErrors.value = [error ?? getGenericError()];
  }

  return {
    loading,
    signInErrors,
    resetSignInErrors,
    signIn,
    sendCode,
    exchangeCode,
    showError,
  };
}
