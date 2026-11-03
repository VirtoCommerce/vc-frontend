import { computed, readonly, ref, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";
import { getMfaSettings, requestMfaChangeCode, updateMfaOrganizationMode, updateMfaUserMode } from "../api/graphql";
import { MFA_MODES } from "../constants";
import type { MfaSettingsFragment } from "../api/graphql/types";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export type MfaScopeType = "user" | "organization";

export type MfaSettingsType = MfaSettingsFragment;

type ChallengeType = {
  twoFactorToken: string;
  destination?: string;
  resendAvailableAt?: number;
};

type ErrorResultType = { errorCode?: string; errorDescription?: string };

function toResendAvailableAt(seconds?: number | null): number | undefined {
  return seconds ? Date.now() + seconds * 1000 : undefined;
}

/**
 * Reads and changes the MFA mode of the current user or of their organization in the current store.
 * Every change is confirmed with a code: requestCode sends it, confirm passes it with the change.
 */
export function useMfaSettings(
  scope: MaybeRefOrGetter<MfaScopeType>,
  organizationId?: MaybeRefOrGetter<string | undefined>,
) {
  const { t, te } = useI18n();

  const isOrganization = computed(() => toValue(scope) === "organization");

  const settings = ref<MfaSettingsType>();
  const sending = ref(false);
  const submitting = ref(false);
  const challenge = ref<ChallengeType>();
  const targetEnabled = ref<boolean>();
  const errors = ref<IdentityErrorType[]>([]);

  const mode = computed(() => (isOrganization.value ? settings.value?.organizationMode : settings.value?.userMode));
  const isOn = computed(() => !!mode.value && mode.value !== MFA_MODES.off);
  const canChange = computed(() =>
    isOrganization.value ? !!settings.value?.canChangeOrganizationMode : !!settings.value?.canChangeUserMode,
  );

  // The module's own codes first, then the sign-in codes it shares with the sign-in form, so the English text of the
  // server never reaches the page
  function setErrors(result?: ErrorResultType | null): void {
    const code = result?.errorCode ?? "unknown";
    const key = [`mfa.errors.${code}`, `shared.account.sign_in_form.errors.${code}`].find((item) => te(item));

    errors.value = [{ code, description: t(key ?? "common.messages.something_went_wrong") }];
  }

  function clearErrors(): void {
    errors.value = [];
  }

  async function fetchSettings(): Promise<void> {
    try {
      settings.value = (await getMfaSettings(toValue(organizationId))) ?? undefined;
    } catch (e) {
      Logger.error(`${useMfaSettings.name}.${fetchSettings.name}`, e);
    }
  }

  async function requestCode(): Promise<boolean> {
    sending.value = true;
    clearErrors();

    try {
      const result = await requestMfaChangeCode();

      if (!result?.succeeded || !result.twoFactorToken) {
        setErrors(result);
        return false;
      }

      challenge.value = {
        twoFactorToken: result.twoFactorToken,
        destination: result.destination ?? settings.value?.destination ?? undefined,
        resendAvailableAt: toResendAvailableAt(result.resendSecondsRemaining),
      };

      return true;
    } catch (e) {
      Logger.error(`${useMfaSettings.name}.${requestCode.name}`, e);
      setErrors();
      return false;
    } finally {
      sending.value = false;
    }
  }

  async function startChange(enabled: boolean): Promise<boolean> {
    targetEnabled.value = enabled;

    return await requestCode();
  }

  async function confirm(code: string): Promise<boolean> {
    if (!challenge.value || targetEnabled.value === undefined) {
      return false;
    }

    submitting.value = true;
    clearErrors();

    try {
      const { twoFactorToken } = challenge.value;
      const result = isOrganization.value
        ? await updateMfaOrganizationMode(toValue(organizationId) ?? "", targetEnabled.value, twoFactorToken, code)
        : await updateMfaUserMode(targetEnabled.value, twoFactorToken, code);

      if (!result?.succeeded) {
        setErrors(result);
        return false;
      }

      settings.value = result.settings ?? settings.value;
      cancel();

      return true;
    } catch (e) {
      Logger.error(`${useMfaSettings.name}.${confirm.name}`, e);
      setErrors();
      return false;
    } finally {
      submitting.value = false;
    }
  }

  function cancel(): void {
    challenge.value = undefined;
    targetEnabled.value = undefined;
    clearErrors();
  }

  return {
    settings: readonly(settings),
    sending: readonly(sending),
    submitting: readonly(submitting),
    challenge: readonly(challenge),
    targetEnabled: readonly(targetEnabled),
    // Read-only for the caller, but still the mutable list the shared code form takes
    errors: computed(() => errors.value),
    mode,
    isOn,
    canChange,
    fetchSettings,
    startChange,
    requestCode,
    confirm,
    cancel,
    clearErrors,
  };
}
