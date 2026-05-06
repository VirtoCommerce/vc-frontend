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
type ImpersonateStatusType = "loading" | "success" | "error" | undefined;

export function useImpersonate() {
  const {
    authorize,
    errors: authErrors,
    isAuthorizing,
    setTokenType,
    setAccessToken,
    setExpiresAt,
    setRefreshToken,
  } = useAuth();
  const broadcast = useBroadcast();
  const notifications = useNotifications();
  const { t } = useI18n();

  const step = ref<StepType>("idle");
  const errors = ref<IdentityErrorType[]>([]);
  const impersonateStatus = ref<ImpersonateStatusType>();

  const loading = computed<boolean>(
    () =>
      isAuthorizing.value ||
      impersonateStatus.value === "loading" ||
      step.value === "verify" ||
      step.value === "impersonate",
  );

  function resetState(): void {
    step.value = "idle";
    errors.value = [];
    impersonateStatus.value = undefined;
  }

  async function requestImpersonateToken(userId: string, redirectTo: string = "/"): Promise<void> {
    step.value = "impersonate";
    impersonateStatus.value = "loading";

    try {
      const { error, data } = await useFetch("/connect/token")
        .post(
          new URLSearchParams({
            grant_type: "impersonate",
            scope: "offline_access",
            user_id: userId,
          }),
          "application/x-www-form-urlencoded",
        )
        .json<ConnectTokenResponseType>();

      if (!data.value || error.value) {
        impersonateStatus.value = "error";
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
        impersonateStatus.value = "success";
        step.value = "success";

        // Ordering invariant: tokens must be persisted to localStorage (above) BEFORE the
        // broadcast fires, so other tabs read the new session on reload. Don't reorder.
        // We use OTHERS + explicit location.href so the current tab can navigate to a
        // non-"/" URL while other tabs follow the existing reload-to-home behavior.
        setTimeout(() => {
          void broadcast.emit(reloadAndOpenMainPage, null, TabsType.OTHERS);
          location.href = redirectTo;
        }, 1000);
      } else {
        notifications.error({ text: t("pages.account.impersonate.error") });
        Logger.error(requestImpersonateToken.name, tokenError, tokenErrors);
        impersonateStatus.value = "error";
        errors.value = [{ code: "impersonate_failed" }];
        step.value = "idle";
      }
    } catch (e) {
      notifications.error({ text: t("pages.account.impersonate.error") });
      Logger.error(requestImpersonateToken.name, e);
      impersonateStatus.value = "error";
      errors.value = [{ code: "impersonate_failed" }];
      step.value = "idle";
    }
  }

  async function revertImpersonate(redirectTo: string = "/"): Promise<void> {
    resetState();
    await requestImpersonateToken("", redirectTo);
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
    // proceeding to requestImpersonateToken would emit unauthorizedErrorEvent and redirect
    // to /sign-in. Surface a generic error to the form instead.
    if (authThrew && !hasAuthErrors) {
      errors.value = [{ code: "generic" }];
      step.value = "idle";
      return;
    }

    if (hasAuthErrors) {
      errors.value = verifyErrors as IdentityErrorType[];
      step.value = "idle";
      return;
    }

    await requestImpersonateToken(targetUserId);
  }

  async function impersonateAuthenticated(targetUserId: string): Promise<void> {
    resetState();
    await requestImpersonateToken(targetUserId);
  }

  return {
    impersonate,
    impersonateAuthenticated,
    revertImpersonate,
    loading,
    step,
    errors,
    resetState,
  };
}
