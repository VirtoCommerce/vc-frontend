<template>
  <div class="impersonate-form">
    <VcAlert
      v-if="step === 'success'"
      class="impersonate-form__success"
      color="success"
      variant="outline-dark"
      size="md"
      icon
    >
      {{ $t("shared.account.impersonate_form.success") }}
    </VcAlert>

    <MfaVerifyForm
      v-else-if="twoFactorChallenge"
      :email="email"
      :challenge="twoFactorChallenge"
      :on-verified="onTwoFactorVerified"
      :back-label="$t('shared.account.impersonate_form.cancel_button')"
      :track-analytics="false"
      @back="onCancel"
      @failed="onTwoFactorFailed"
    />

    <form v-else class="impersonate-form__form" @submit="onSubmit">
      <VcAlert
        v-for="(message, index) in translatedErrors"
        :key="`${index}-${message}`"
        class="impersonate-form__error"
        color="danger"
        variant="outline-dark"
        size="sm"
        icon
      >
        {{ message }}
      </VcAlert>

      <VcInput
        ref="emailInput"
        v-model.trim="email"
        name="email"
        class="impersonate-form__field"
        type="email"
        :label="$t('shared.account.impersonate_form.email_label')"
        :placeholder="$t('shared.account.impersonate_form.email_placeholder')"
        :disabled="loading"
        :message="validationErrors.email"
        :error="!!validationErrors.email"
        autocomplete="email"
        required
      />

      <VcInput
        v-model="password"
        name="password"
        class="impersonate-form__field"
        type="password"
        :label="$t('shared.account.impersonate_form.password_label')"
        :placeholder="$t('shared.account.impersonate_form.password_placeholder')"
        :disabled="loading"
        :message="validationErrors.password"
        :error="!!validationErrors.password"
        autocomplete="current-password"
        required
      />

      <div class="impersonate-form__actions">
        <VcButton type="submit" class="impersonate-form__submit" :loading="loading" :disabled="!meta.valid" no-wrap>
          {{ $t("shared.account.impersonate_form.submit_button") }}
        </VcButton>

        <VcButton
          type="button"
          class="impersonate-form__cancel"
          variant="outline"
          :disabled="loading"
          no-wrap
          @click="onCancel"
        >
          {{ $t("shared.account.impersonate_form.cancel_button") }}
        </VcButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed, nextTick, useTemplateRef, watch } from "vue";
import { object, string } from "yup";
import { useErrorsTranslator } from "@/core/composables";
import { useImpersonate } from "@/shared/account/composables";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import MfaVerifyForm from "@/shared/sign-in/components/mfa-verify-form.vue";

interface IEmits {
  (event: "success"): void;
  (event: "cancel"): void;
}

interface IProps {
  targetUserId: string;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const schema = toTypedSchema(
  object({
    email: string().required().email(),
    password: string().required(),
  }),
);

const {
  errors: validationErrors,
  meta,
  handleSubmit,
} = useForm({
  validationSchema: schema,
});

const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");

const { impersonate, impersonateAuthenticated, loading, step, errors, twoFactorChallenge, resetState, failTwoFactor } =
  useImpersonate();

const { translate } = useErrorsTranslator<IdentityErrorType>("shared.account.impersonate_form.errors");

const emailInput = useTemplateRef<{ inputElement: HTMLInputElement | null }>("emailInput");

const translatedErrors = computed<string[]>(() => {
  const list = errors.value ?? [];
  return list
    .map((error) => translate(error))
    .filter((message): message is string => typeof message === "string" && message.length > 0);
});

const onSubmit = handleSubmit(async () => {
  await impersonate(email.value, password.value, props.targetUserId);

  if (step.value === "success") {
    emit("success");
  }
});

async function onTwoFactorVerified(): Promise<void> {
  await impersonateAuthenticated(props.targetUserId);

  if (step.value !== "success") {
    throw new Error("The impersonation failed after the sign-in code was accepted");
  }

  emit("success");
}

async function onTwoFactorFailed(error: IdentityErrorType): Promise<void> {
  failTwoFactor(error);

  await nextTick();
  emailInput.value?.inputElement?.focus();
}

function onCancel(): void {
  emit("cancel");
}

watch([email, password], () => {
  if (errors.value.length > 0) {
    resetState();
  }
});
</script>

<style lang="scss">
.impersonate-form {
  @apply mx-auto flex w-full max-w-md flex-col text-start;

  &__success {
    @apply mb-4;
  }

  &__form {
    @apply flex flex-col;
  }

  &__error {
    @apply mb-4;
  }

  &__field {
    @apply mb-4;
  }

  &__actions {
    @apply mt-4 flex flex-col gap-3;

    @media (width >= theme("screens.sm")) {
      @apply flex-row;
    }
  }

  &__submit {
    @apply flex-1 shrink;
  }

  &__cancel {
    @apply flex-1;
  }
}
</style>
