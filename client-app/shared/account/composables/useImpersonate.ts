import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useFetch } from "@/core/api/common";
import { useAuth } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { TabsType, useBroadcast, reloadAndOpenMainPage } from "@/shared/broadcast";
import { useNotifications } from "@/shared/notification";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { ConnectTokenResponseType } from "@/core/types";

type StepType = "idle" | "verify" | "impersonate" | "success";

export function useImpersonate() {
  const { authorize, errors: authErrors, setTokenType, setAccessToken, setExpiresAt, setRefreshToken } = useAuth();
  const broadcast = useBroadcast();
  const notifications = useNotifications();
  const { t } = useI18n();

  const step = ref<StepType>("idle");
  const errors = ref<IdentityErrorType[]>([]);

  const loading = computed<boolean>(() => step.value === "verify" || step.value === "impersonate");

  function resetState(): void {
    step.value = "idle";
    errors.value = [];
  }

  async function doImpersonate(targetUserId: string): Promise<void> {
    step.value = "impersonate";

    try {
      const { error, data } = await useFetch("/connect/token")
        .post(
          new URLSearchParams({
            grant_type: "impersonate",
            scope: "offline_access",
            user_id: targetUserId,
          }),
          "application/x-www-form-urlencoded",
        )
        .json<ConnectTokenResponseType>();

      if (!data.value || error.value) {
        errors.value = [{ code: "impersonate_failed" }];
        step.value = "idle";
        return;
      }

      const {
        access_token,
        token_type,
        expires_in,
        refresh_token,
        error: tokenError,
        errors: tokenErrors,
      } = data.value;

      if (access_token && token_type && expires_in && refresh_token) {
        setAccessToken(access_token);
        setExpiresAt(expires_in);
        setTokenType(token_type);
        setRefreshToken(refresh_token);
        step.value = "success";

        // reload all tabs to renew state
        setTimeout(() => {
          void broadcast.emit(reloadAndOpenMainPage, null, TabsType.ALL);
        }, 1000);
      } else {
        notifications.error({ text: t("pages.account.impersonate.error") });
        Logger.error(doImpersonate.name, tokenError, tokenErrors);
        errors.value = [{ code: "impersonate_failed" }];
        step.value = "idle";
      }
    } catch (e) {
      notifications.error({ text: t("pages.account.impersonate.error") });
      Logger.error(doImpersonate.name, e);
      errors.value = [{ code: "impersonate_failed" }];
      step.value = "idle";
    }
  }

  async function impersonate(supportEmail: string, supportPassword: string, targetUserId: string): Promise<void> {
    resetState();

    step.value = "verify";

    let authThrew = false;
    try {
      await authorize(supportEmail, supportPassword);
    } catch (e) {
      authThrew = true;
      Logger.error(impersonate.name, e);
    }

    const verifyErrors = authErrors.value;
    const hasAuthErrors = !!verifyErrors && verifyErrors.length > 0;

    // Non-400 failures (network, 5xx, etc.) leave authErrors empty but throw the promise.
    // If authorize threw without producing an errors array, the token was NOT written —
    // proceeding to doImpersonate would emit unauthorizedErrorEvent and redirect to /sign-in.
    // Surface a generic error to the form instead.
    if (authThrew && !hasAuthErrors) {
      errors.value = [{ code: "generic" }];
      step.value = "idle";
      return;
    }

    if (hasAuthErrors) {
      errors.value = verifyErrors;
      step.value = "idle";
      return;
    }

    await doImpersonate(targetUserId);
  }

  async function impersonateAuthenticated(targetUserId: string): Promise<void> {
    resetState();
    await doImpersonate(targetUserId);
  }

  return {
    impersonate,
    impersonateAuthenticated,
    loading,
    step,
    errors,
    resetState,
  };
}
