<template>
  <VcWidget v-if="isVisible" :title="$t(`mfa.${scope}.title`)" size="lg" class="mfa-settings">
    <template v-if="showSwitch" #append>
      <VcButton
        size="sm"
        :color="isOn ? 'secondary' : 'primary'"
        :variant="isOn ? 'outline' : 'solid'"
        :loading="sending"
        :disabled="!isOn && !settings?.isProviderAvailable"
        @click="startChange(!isOn)"
      >
        {{ isOn ? $t("mfa.buttons.turn_off") : $t("mfa.buttons.turn_on") }}
      </VcButton>
    </template>

    <div class="mfa-settings__body">
      <p class="mfa-settings__status">
        <VcBadge :color="statusOn ? 'success' : 'neutral'" variant="soft" size="sm" rounded>
          {{ statusOn ? $t("mfa.status.on") : $t("mfa.status.off") }}
        </VcBadge>

        <span>{{ statusText }}</span>
      </p>

      <p v-if="hint" class="mfa-settings__hint">{{ hint }}</p>

      <VcAlert
        v-if="!settings?.isProviderAvailable && showSwitch && !isOn"
        color="warning"
        variant="soft"
        size="sm"
        icon
      >
        {{ $t("mfa.messages.confirm_email") }}
      </VcAlert>

      <VcAlert v-if="errors.length && !challenge" color="danger" variant="soft" size="sm" icon>
        {{ errors[0].description || $t("common.messages.something_went_wrong") }}
      </VcAlert>

      <div v-if="challenge" class="mfa-settings__code">
        <SignInCodeForm
          :id-prefix="`mfa-${scope}`"
          :subtitle="
            $t(targetEnabled ? 'mfa.code.subtitle_turn_on' : 'mfa.code.subtitle_turn_off', {
              destination: challenge.destination,
            })
          "
          :back-label="$t('mfa.buttons.cancel')"
          :submit-label="$t('mfa.buttons.confirm')"
          :loading="submitting"
          :errors="errors"
          :resend-available-at="challenge.resendAvailableAt"
          @submit="onSubmit"
          @resend="requestCode"
          @clear-errors="errors = []"
          @back="cancel"
        />
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables";
import { useNotifications } from "@/shared/notification";
import { useMfaSettings } from "../composables/useMfaSettings";
import { MFA_MODES, MFA_STORE_MODES } from "../constants";
import type { MfaScopeType } from "../composables/useMfaSettings";
import SignInCodeForm from "@/shared/sign-in/components/sign-in-code-form.vue";

interface IProps {
  scope: MfaScopeType;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const notifications = useNotifications();
const { user } = useUser();

const organizationId = computed(() =>
  props.scope === "organization" ? (user.value?.contact?.organizationId ?? undefined) : undefined,
);

const {
  settings,
  sending,
  submitting,
  challenge,
  targetEnabled,
  errors,
  mode,
  isOn,
  canChange,
  fetchSettings,
  startChange,
  requestCode,
  confirm,
  cancel,
} = useMfaSettings(() => props.scope, organizationId);

const isSelfServiceStore = computed(
  () =>
    settings.value?.storeMode === MFA_STORE_MODES.customerChoice ||
    settings.value?.storeMode === MFA_STORE_MODES.adminManaged,
);

const isVisible = computed(() => {
  if (!settings.value) {
    return false;
  }

  return props.scope === "organization"
    ? isSelfServiceStore.value
    : isSelfServiceStore.value || settings.value.isRequired;
});

// While the company requires MFA the personal setting changes nothing, so the user gets no switch
const isRequiredByOrganization = computed(
  () => props.scope === "user" && !!settings.value?.isRequired && settings.value.requiredBy === "Organization",
);

const showSwitch = computed(() => canChange.value && !challenge.value && !isRequiredByOrganization.value);

// The user widget shows whether the sign-in needs the code, the organization widget what the organization chose
const statusOn = computed(() => (props.scope === "organization" ? isOn.value : !!settings.value?.isRequired));

const statusText = computed(() => {
  if (props.scope === "organization") {
    return t(`mfa.organization.modes.${mode.value ?? MFA_MODES.off}`);
  }

  if (!settings.value?.isRequired) {
    return t("mfa.user.not_required");
  }

  const requiredBy =
    settings.value.requiredBy === "User" && mode.value === MFA_MODES.required
      ? "Administrator"
      : settings.value.requiredBy;

  return t(`mfa.user.required_by.${requiredBy}`, { destination: settings.value.destination ?? "" });
});

const hint = computed(() => {
  if (settings.value?.storeMode === MFA_STORE_MODES.adminManaged) {
    return t("mfa.hints.admin_managed");
  }

  if (mode.value === MFA_MODES.required) {
    return t("mfa.hints.locked");
  }

  if (isRequiredByOrganization.value) {
    return t("mfa.hints.organization");
  }

  return undefined;
});

async function onSubmit(code: string): Promise<void> {
  const enabled = targetEnabled.value;

  if (await confirm(code)) {
    notifications.success({
      text: t(enabled ? "mfa.messages.turned_on" : "mfa.messages.turned_off"),
      duration: 5000,
      single: true,
    });
  }
}

onMounted(fetchSettings);
</script>

<style lang="scss">
.mfa-settings {
  &__body {
    @apply flex flex-col gap-3;
  }

  &__status {
    @apply flex flex-wrap items-center gap-2 text-sm;
  }

  &__hint {
    @apply text-xs text-neutral;
  }

  &__code {
    @apply max-w-md;
  }
}
</style>
