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
type FailedStepType = "verify" | "impersonate" | null;
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
  const failedStep = ref<FailedStepType>(null);
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
    failedStep.value = null;
    errors.value = [];
    impersonateStatus.value = undefined;
  }

  async function doImpersonate(targetUserId: string): Promise<void> {
    impersonateStatus.value = "loading";

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
        impersonateStatus.value = "error";
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

        // reload all tabs to renew state
        setTimeout(() => {
          void broadcast.emit(reloadAndOpenMainPage, null, TabsType.ALL);
        }, 1000);
      } else {
        notifications.error({ text: t("pages.account.impersonate.error") });
        Logger.error(doImpersonate.name, tokenError, tokenErrors);
        impersonateStatus.value = "error";
      }
    } catch (e) {
      notifications.error({ text: t("pages.account.impersonate.error") });
      Logger.error(doImpersonate.name, e);
      impersonateStatus.value = "error";
    }
  }

  /**
   * Two-step flow: verify Support credentials via grant_type=password,
   * then impersonate the target user via grant_type=impersonate.
   *
   * Intentionally does NOT call useSignMeIn().signIn — Support must not merge
   * their (or the anonymous) cart with the customer's cart. After authorize()
   * succeeds Apollo may briefly hold the Support token, but doImpersonate()
   * immediately overwrites it and broadcasts a full reload one second later.
   */
  async function impersonate(supportEmail: string, supportPassword: string, targetUserId: string): Promise<void> {
    resetState();

    if (!targetUserId) {
      failedStep.value = "verify";
      errors.value = [{ code: "invalid_user_id" }];
      return;
    }

    step.value = "verify";
    try {
      await authorize(supportEmail, supportPassword);
    } catch (e) {
      Logger.error(impersonate.name, e);
    }

    const verifyErrors = authErrors.value;
    if (verifyErrors && verifyErrors.length > 0) {
      failedStep.value = "verify";
      errors.value = verifyErrors as IdentityErrorType[];
      step.value = "idle";
      return;
    }

    step.value = "impersonate";
    await doImpersonate(targetUserId);

    if (impersonateStatus.value === "error") {
      failedStep.value = "impersonate";
      errors.value = [{ code: "impersonate_failed" }];
      step.value = "idle";
      return;
    }

    step.value = "success";
  }

  /**
   * Single-step flow for users that are already authenticated and have
   * permission to impersonate. Skips the verify step and goes straight to
   * grant_type=impersonate. Use this when the Support user is already signed
   * in to storefront — there's no need to re-collect credentials.
   */
  async function impersonateAuthenticated(targetUserId: string): Promise<void> {
    resetState();

    if (!targetUserId) {
      failedStep.value = "verify";
      errors.value = [{ code: "invalid_user_id" }];
      return;
    }

    step.value = "impersonate";
    await doImpersonate(targetUserId);

    if (impersonateStatus.value === "error") {
      failedStep.value = "impersonate";
      errors.value = [{ code: "impersonate_failed" }];
      step.value = "idle";
      return;
    }

    step.value = "success";
  }

  return {
    impersonate,
    impersonateAuthenticated,
    loading,
    step,
    failedStep,
    errors,
    resetState,
  };
}
