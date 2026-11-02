<template>
  <MfaVerifyForm
    v-if="twoFactorChallenge"
    :email="email"
    :challenge="twoFactorChallenge"
    :on-verified="signIn"
    @back="backToPassword"
    @failed="backToPassword"
  />

  <form v-else class="sign-in-form" @submit="onSubmit">
    <!-- Errors block -->
    <div role="alert">
      <VcAlert
        v-for="error in errors"
        :key="error.code"
        data-test-id="sign-in-error-alert"
        class="sign-in-form__error"
        color="danger"
        size="sm"
        variant="outline-dark"
        icon
      >
        <span v-if="isLockoutError(error?.code)">
          {{ translate(error) }}
          <ContactAdministratorLink />.
        </span>

        <span v-else-if="error?.code === IdentityErrors.PASSWORD_EXPIRED" class="sign-in-form__password-expired">
          <span>
            {{ translate(error) }}
          </span>
          <!-- Keep the A tag to reinitialize the app -->
          <a :href="ROUTES.CHANGE_PASSWORD.PATH" class="sign-in-form__change-password-link">
            {{ $t("common.buttons.set_new_password") }}
          </a>
        </span>

        <span v-else>
          {{ translate(error) }}
        </span>
      </VcAlert>
    </div>

    <VcInput
      ref="emailInput"
      v-model.trim="email"
      name="email"
      class="sign-in-form__input"
      :label="$t('common.labels.email')"
      :placeholder="$t('common.placeholders.email')"
      :disabled="loading"
      required
      :message="validationErrors.email"
      :error="!!validationErrors.email"
      autocomplete="email webauthn"
      test-id-input="email-input"
    />

    <VcInput
      v-model="password"
      class="sign-in-form__input"
      :label="$t('common.labels.password')"
      :placeholder="$t('common.placeholders.password')"
      :disabled="loading"
      type="password"
      required
      :message="validationErrors.password"
      :error="!!validationErrors.password"
      autocomplete="current-password"
      test-id-input="password-input"
    />

    <div class="sign-in-form__options">
      <VcCheckbox v-model="rememberMe" :disabled="loading">
        {{ $t("shared.account.sign_in_form.remember_me_label") }}
      </VcCheckbox>

      <router-link to="/forgot-password" class="sign-in-form__forgot-password-link" data-test-id="forgot-password-link">
        {{ $t("shared.account.sign_in_form.forgot_password_link") }}
      </router-link>
    </div>

    <!-- Form actions -->
    <div :class="['sign-in-form__actions', { 'sign-in-form__actions--constrained': !props.growButtons }]">
      <VcButton :loading="loading" type="submit" class="sign-in-form__submit" no-wrap data-test-id="login-button">
        {{ $t("shared.account.sign_in_form.login_button") }}
      </VcButton>

      <VcButton
        :to="{ name: 'SignUp' }"
        :disabled="loading"
        variant="outline"
        class="sign-in-form__register"
        no-wrap
        data-test-id="sign-in-page.registration-button"
      >
        {{ $t("shared.account.sign_in_form.registration_button") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import { object, string } from "yup";
import { useAnalytics, useAuth, useErrorsTranslator } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { isLockoutError, Logger } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useSignMeIn } from "@/shared/account/composables";
import { ContactAdministratorLink } from "@/shared/common";
import { PasswordStep } from "@/shared/sign-in/enums";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { TwoFactorChallengeType } from "@/core/types";
import MfaVerifyForm from "@/shared/sign-in/components/mfa-verify-form.vue";

const emit = defineEmits<{ (event: "stepChanged", step: PasswordStep): void }>();

const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

const { authorize, twoFactorChallenge: authTwoFactorChallenge } = useAuth();
const { analytics } = useAnalytics();

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

const { translate } = useErrorsTranslator<IdentityErrorType>("shared.account.sign_in_form.errors");

const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");

const rememberMe = ref(false);

const emailInput = useTemplateRef<{ inputElement: HTMLInputElement | null }>("emailInput");

const twoFactorChallenge = ref<TwoFactorChallengeType>();

const { errors, loading, signIn, resetErrors } = useSignMeIn();

// One login event per attempt. A wrong password both throws and fills `errors`, whose codes say more than the
// thrown message; a throw without them still failed, so it never falls through to a success.
const onSubmit = handleSubmit(async () => {
  let thrown: Error | undefined;

  try {
    await authorize(email.value, password.value);
    await signIn();
  } catch (err) {
    thrown = err instanceof Error ? err : new Error(String(err));
  }

  twoFactorChallenge.value = authTwoFactorChallenge.value;
  if (twoFactorChallenge.value) {
    resetErrors();
    return;
  }

  if (thrown) {
    Logger.error("SignInForm", thrown);
  }

  if (errors.value?.length) {
    analytics("login", "password", {
      success: false,
      errors: errors.value.map((error) => `${error.code}: ${error.description}`).join(", "),
    });
    return;
  }

  if (thrown) {
    analytics("login", "password", { success: false, errors: thrown.message });
    return;
  }

  analytics("login", "password", { success: true });
});

async function backToPassword(error?: IdentityErrorType): Promise<void> {
  twoFactorChallenge.value = undefined;
  resetErrors();

  if (error) {
    errors.value = [error];
  }

  await nextTick();
  emailInput.value?.inputElement?.focus();
}

watch(twoFactorChallenge, (value) => {
  emit("stepChanged", value ? PasswordStep.TwoFactor : PasswordStep.Password);
});

onBeforeUnmount(() => {
  if (twoFactorChallenge.value) {
    emit("stepChanged", PasswordStep.Password);
  }
});

watch(meta, (value) => {
  if (value.touched) {
    resetErrors();
  }
});
</script>

<style lang="scss">
.sign-in-form {
  @apply text-start;

  &__error {
    @apply mb-4;
  }

  &__password-expired {
    @apply flex place-items-center justify-between;
  }

  &__change-password-link {
    @apply text-sm font-bold text-accent-700;

    &:hover {
      @apply text-accent;
    }
  }

  &__input {
    @apply mb-4;
  }

  &__options {
    @apply flex justify-between;
  }

  &__forgot-password-link {
    @apply text-sm font-bold text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }
  }

  &__actions {
    @apply mt-8 flex flex-wrap gap-4;

    &--constrained {
      @apply max-w-sm;
    }
  }

  &__submit {
    @apply flex-1 shrink;
  }

  &__register {
    @apply flex-1;
  }
}
</style>
