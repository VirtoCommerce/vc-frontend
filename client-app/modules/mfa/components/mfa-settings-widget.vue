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
        {{ errors[0].description }}
      </VcAlert>

      <div v-if="challenge" class="mfa-settings__code">
        <SignInCodeForm
          ref="codeFormRef"
          :id-prefix="`mfa-${scope}`"
          :subtitle="
            $t(targetEnabled ? 'mfa.code.subtitle_turn_on' : 'mfa.code.subtitle_turn_off', {
              destination: challenge.destination,
            })
          "
          :back-label="$t('mfa.buttons.cancel')"
          :submit-label="$t('mfa.buttons.confirm')"
          :loading="sending || submitting"
          :errors="errors"
          :resend-available-at="challenge.resendAvailableAt"
          @submit="onSubmit"
          @resend="onResend"
          @clear-errors="clearErrors"
          @back="cancel"
        />
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables";
import { useNotifications } from "@/shared/notification";
import { useMfaSettings } from "../composables/useMfaSettings";
import { MFA_MODES, MFA_REQUIRED_BY, MFA_STORE_MODES } from "../constants";
import type { MfaScopeType } from "../composables/useMfaSettings";
import SignInCodeForm from "@/shared/sign-in/components/sign-in-code-form.vue";

interface IProps {
  scope: MfaScopeType;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const notifications = useNotifications();
const { user, operator } = useUser();

const codeFormRef = useTemplateRef<InstanceType<typeof SignInCodeForm>>("codeFormRef");

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
  clearErrors,
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
  () =>
    props.scope === "user" &&
    !!settings.value?.isRequired &&
    settings.value.requiredBy === MFA_REQUIRED_BY.organization,
);

// The server refuses a change made on behalf of the customer, so the operator gets no switch
const isOperator = computed(() => !!operator.value);

const showSwitch = computed(
  () => canChange.value && !isOperator.value && !challenge.value && !isRequiredByOrganization.value,
);

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
    settings.value.requiredBy === MFA_REQUIRED_BY.user && mode.value === MFA_MODES.required
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

  if (isOperator.value && canChange.value) {
    return t("mfa.hints.operator");
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
    return;
  }

  await codeFormRef.value?.reset();
}

async function onResend(): Promise<void> {
  if (await requestCode()) {
    await codeFormRef.value?.reset(t("shared.sign_in.sign_in_code_form.live_resent"));
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
