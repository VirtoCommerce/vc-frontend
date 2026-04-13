<template>
  <form class="sign-in-form" @submit="onSubmit">
    <!-- Errors block -->
    <VcAlert
      v-for="error in errors"
      :key="error.code"
      :data-test-id="`sign-in-page.sign-in-error-${error.code}-alert`"
      class="sign-in-form__error"
      color="danger"
      size="sm"
      variant="outline-dark"
      icon
    >
      <span v-if="error?.code === IdentityErrors.USER_IS_LOCKED_OUT">
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

    <VcInput
      v-model.trim="email"
      name="email"
      class="sign-in-form__input"
      :label="$t('common.labels.email')"
      :placeholder="$t('common.placeholders.email')"
      :disabled="loading"
      required
      :message="validationErrors.email"
      :error="!!validationErrors.email"
      autocomplete="email"
      test-id-input="sign-in-page.email-input"
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
      test-id-input="sign-in-page.password-input"
    />

    <div class="sign-in-form__options">
      <VcCheckbox v-model="rememberMe" :disabled="loading">
        {{ $t("shared.account.sign_in_form.remember_me_label") }}
      </VcCheckbox>

      <router-link
        to="/forgot-password"
        class="sign-in-form__forgot-password-link"
        data-test-id="sign-in-page.forgot-password-link"
      >
        {{ $t("shared.account.sign_in_form.forgot_password_link") }}
      </router-link>
    </div>

    <!-- Form actions -->
    <div :class="['sign-in-form__actions', { 'sign-in-form__actions--constrained': !props.growButtons }]">
      <VcButton
        :loading="loading"
        type="submit"
        class="sign-in-form__submit"
        no-wrap
        data-test-id="sign-in-page.login-button"
      >
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
import { ref, watch } from "vue";
import { object, string } from "yup";
import { useAnalytics, useAuth, useErrorsTranslator } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { Logger } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useSignMeIn } from "@/shared/account/composables";
import { ContactAdministratorLink } from "@/shared/common";
import type { IdentityErrorType } from "@/core/api/graphql/types";

const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

const { authorize } = useAuth();
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

const { errors, loading, signIn, resetErrors } = useSignMeIn();

const onSubmit = handleSubmit(async () => {
  try {
    await authorize(email.value, password.value);
    await signIn();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    Logger.error("SignInForm", error);
    analytics("login", "password", {
      success: false,
      errors: error?.message,
    });
  }

  if (errors.value?.length) {
    analytics("login", "password", {
      success: false,
      errors: errors.value.map((error) => `${error.code}: ${error.description}`).join(", "),
    });
    return;
  }

  analytics("login", "password", { success: true });
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
    @apply text-sm font-bold text-accent-700 hover:text-accent;
  }

  &__input {
    @apply mb-4;
  }

  &__options {
    @apply flex justify-between;
  }

  &__forgot-password-link {
    @apply text-sm font-bold text-[--link-color] hover:text-[--link-hover-color];
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
