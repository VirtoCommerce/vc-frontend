<template>
  <VcEmptyPage icon="outline-security-pc" image="reg.jpg" hide-mobile-side>
    <div class="w-full sm:pe-12 lg:pe-24 lg:ps-12">
      <VcTypography tag="h1" class="mb-3">
        {{ $t("pages.confirm_invitation.header") }}
      </VcTypography>

      <p v-html-safe="$t('pages.confirm_invitation.text')" class="mb-4 text-sm" />

      <form class="text-start" @submit="onSubmit">
        <VcInput
          v-model="firstName"
          :label="$t('common.labels.first_name')"
          :placeholder="$t('common.placeholders.first_name')"
          :message="errors.firstName"
          :error="!!errors.firstName"
          :disabled="loading"
          :maxlength="64"
          class="mb-4"
          autocomplete="given-name"
          required
        />

        <VcInput
          v-model="lastName"
          :label="$t('common.labels.last_name')"
          :placeholder="$t('common.placeholders.last_name')"
          :message="errors.lastName"
          :error="!!errors.lastName"
          :disabled="loading"
          :maxlength="64"
          class="mb-4"
          autocomplete="family-name"
          required
        />

        <VcInput
          :model-value="email"
          :label="$t('common.labels.email')"
          :message="errors.email"
          :error="!!errors.email"
          class="mb-4"
          type="email"
          autocomplete="email"
          required
          disabled
        />

        <div class="flex flex-col gap-x-6 gap-y-4 md:flex-row">
          <VcInput
            v-model="password"
            :label="$t('common.labels.password')"
            :placeholder="$t('common.placeholders.password')"
            :message="errors.password"
            :error="!!errors.password"
            :disabled="loading"
            :maxlength="64"
            type="password"
            autocomplete="new-password"
            class="md:w-1/2"
            required
          />

          <VcInput
            v-model="confirmPassword"
            :label="$t('common.labels.confirm_password')"
            :placeholder="$t('common.placeholders.confirm_password')"
            :message="errors.confirmPassword"
            :error="!!errors.confirmPassword"
            :disabled="loading"
            :maxlength="64"
            type="password"
            autocomplete="off"
            class="md:w-1/2"
            required
          />
        </div>

        <div class="mt-6">
          <PasswordTips v-if="passwordRequirements" :requirements="passwordRequirements" />

          <VcAlert
            v-for="error in commonErrors"
            :key="error"
            color="danger"
            size="sm"
            variant="solid-light"
            class="my-4 text-xs"
            icon
          >
            {{ error }}
          </VcAlert>

          <div class="max-sm:text-center">
            <VcButton :loading="loading" :disabled="!meta.valid" type="submit" class="mt-4" min-width="12rem">
              {{ $t("common.buttons.register") }}
            </VcButton>
          </div>
        </div>
      </form>
    </div>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, ref as yupRef, string } from "yup";
import { useErrorsTranslator, usePageHead, useRouteQueryParam } from "@/core/composables";
import { PasswordTips, RegistrationSuccessModal, usePasswordRequirements, useUser } from "@/shared/account";
import { useModal } from "@/shared/modal";
import type { IdentityErrorInfoType } from "@/core/api/graphql/types";

const commonErrors = ref<string[]>([]);

const { t } = useI18n();

usePageHead({
  title: t("pages.confirm_invitation.meta.title"),
});

const { openModal } = useModal();
const { loading, registerByInvite } = useUser();
const { passwordRequirements } = usePasswordRequirements();
const { translate } = useErrorsTranslator<IdentityErrorInfoType>("identity_error");

const userId = useRouteQueryParam<string>("userId");
const email = useRouteQueryParam<string>("email");
const token = useRouteQueryParam<string>("token");

const schema = toTypedSchema(
  object({
    firstName: string().trim().required().max(64),
    lastName: string().trim().required().max(64),
    email: string().required().email(),
    password: string().required(),
    confirmPassword: string()
      .required()
      .oneOf([yupRef("password")], t("common.messages.passwords_do_not_match")),
  }),
);

const { errors, meta, handleSubmit, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    email: email.value,
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  },
});

const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: password } = useField<string>("password");
const { value: confirmPassword } = useField<string>("confirmPassword");

const onSubmit = handleSubmit(async (data) => {
  commonErrors.value = [];

  const result = await registerByInvite({
    userId: userId.value,
    token: token.value,
    username: email.value,
    firstName: data.firstName?.trim() || "",
    lastName: data.lastName?.trim() || "",
    password: data.password || "",
  });

  if (result.succeeded) {
    openModal({
      component: RegistrationSuccessModal,
    });
  } else if (result.errors?.length) {
    result.errors.forEach((error) => {
      const errorDescription = translate(error);

      switch (error.code) {
        case "PasswordTooShort":
        case "PasswordRequiresLower":
        case "PasswordRequiresUpper":
        case "PasswordRequiresUniqueChars":
        case "PasswordRequiresDigit":
        case "PasswordRequiresNonAlphanumeric":
        case "RecentPasswordUsed":
        case "InvalidPasswordHasherCompatibilityMode":
        case "InvalidPasswordHasherIterationCount":
          setFieldError("password", errorDescription);
          break;

        default:
          if (errorDescription) {
            commonErrors.value.push(errorDescription);
          }
      }
    });
  }
});
</script>
