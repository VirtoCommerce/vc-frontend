import { computed, ref, toValue } from "vue";
import { Logger } from "@/core/utilities";
import { getMfaSettings, requestMfaChangeCode, updateMfaOrganizationMode, updateMfaUserMode } from "../api/graphql";
import { MFA_MODES } from "../constants";
import type { GetMfaSettingsQuery } from "../api/graphql/types";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export type MfaScopeType = "user" | "organization";

export type MfaSettingsType = NonNullable<GetMfaSettingsQuery["mfaSettings"]>;

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
  const isOrganization = computed(() => toValue(scope) === "organization");

  const settings = ref<MfaSettingsType>();
  const loading = ref(false);
  const sending = ref(false);
  const submitting = ref(false);
  const challenge = ref<ChallengeType>();
  const targetEnabled = ref<boolean>();
  const errors = ref<IdentityErrorType[]>([]);

  const mode = computed(() => (isOrganization.value ? settings.value?.organizationMode : settings.value?.userMode));
  const isOn = computed(() => !!mode.value && mode.value !== MFA_MODES.off);
  const isLockedByAdministrator = computed(() => mode.value === MFA_MODES.required);
  const canChange = computed(() =>
    isOrganization.value ? !!settings.value?.canChangeOrganizationMode : !!settings.value?.canChangeUserMode,
  );

  function setErrors(result?: ErrorResultType | null): void {
    errors.value = [
      {
        code: result?.errorCode ?? "unknown",
        description: result?.errorDescription ?? undefined,
      },
    ];
  }

  async function fetchSettings(): Promise<void> {
    loading.value = true;

    try {
      settings.value = (await getMfaSettings(toValue(organizationId))) ?? undefined;
    } catch (e) {
      Logger.error(`${useMfaSettings.name}.${fetchSettings.name}`, e);
    } finally {
      loading.value = false;
    }
  }

  async function requestCode(): Promise<boolean> {
    sending.value = true;
    errors.value = [];

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
    errors.value = [];

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
    errors.value = [];
  }

  return {
    settings,
    loading,
    sending,
    submitting,
    challenge,
    targetEnabled,
    errors,
    mode,
    isOn,
    isLockedByAdministrator,
    canChange,
    fetchSettings,
    startChange,
    requestCode,
    confirm,
    cancel,
  };
}
