<template>
  <div>
    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between lg:mx-0">
      <h2 v-t="'pages.account.profile.title'" class="text-3xl font-bold uppercase text-gray-800" />
    </div>

    <div
      class="polygon-bg flex flex-col bg-white p-6 shadow-sm [--polygon-bg-position:right_bottom_-180px] lg:rounded lg:border"
    >
      <form class="flex flex-col lg:w-1/2" @submit.prevent="onSubmit">
        <VcInput
          v-model.trim="firstName"
          :label="$t('common.labels.first_name')"
          :placeholder="$t('common.placeholders.first_name')"
          :disabled="isSubmitting"
          :maxlength="64"
          :message="errors.firstName"
          :error="!!errors.firstName"
          name="firstName"
          class="mb-5"
          required
        />

        <VcInput
          v-model.trim="lastName"
          :label="$t('common.labels.last_name')"
          :placeholder="$t('common.placeholders.first_name')"
          :disabled="isSubmitting"
          :maxlength="64"
          :message="errors.lastName"
          :error="!!errors.lastName"
          name="lastName"
          class="mb-5"
          required
        />

        <VcInput
          :model-value="email"
          :label="$t('common.labels.email')"
          :placeholder="$t('common.placeholders.first_name')"
          name="email"
          autocomplete="off"
          class="mb-5"
          disabled
        />

        <div class="my-5 flex items-center">
          <svg width="54" height="54" class="-ml-0.5 mr-2 text-[color:var(--color-primary)]">
            <use href="/static/images/polygon-key.svg#main" />
          </svg>

          <h3
            v-t="'pages.account.profile.change_password_title'"
            class="text-xl font-extrabold uppercase text-gray-800"
          />
        </div>

        <VcInput
          v-model="oldPassword"
          :label="$t('shared.account.change_password_form.current_pass_label')"
          :placeholder="$t('shared.account.change_password_form.current_pass_placeholder')"
          :disabled="isSubmitting"
          :maxlength="64"
          :message="errors.oldPassword"
          :error="!!errors.oldPassword"
          autocomplete="off"
          type="password"
          name="oldPassword"
          class="mb-5"
        />

        <VcInput
          :model-value="newPassword"
          :label="$t('shared.account.change_password_form.new_pass_label')"
          :placeholder="$t('shared.account.change_password_form.new_pass_placeholder')"
          :disabled="isSubmitting"
          :maxlength="64"
          :required="!!oldPassword"
          :message="errors.newPassword"
          :error="!!errors.newPassword"
          type="password"
          name="newPassword"
          class="mb-5"
          autocomplete="new-password"
          @update:model-value="oldPassword ? (newPassword = $event.trim()) : null"
        />

        <VcInput
          :model-value="confirmNewPassword"
          :label="$t('shared.account.change_password_form.confirm_new_pass_label')"
          :placeholder="$t('shared.account.change_password_form.confirm_new_pass_placeholder')"
          :disabled="isSubmitting"
          :maxlength="64"
          :required="!!oldPassword"
          :message="errors.confirmNewPassword"
          :error="!!errors.confirmNewPassword"
          type="password"
          name="confirmNewPassword"
          class="mb-5"
          autocomplete="off"
          @update:model-value="oldPassword ? (confirmNewPassword = $event.trim()) : null"
        />

        <PasswordTips v-if="passwordRequirements" :requirements="passwordRequirements" />

        <VcAlert
          v-for="error in commonErrors"
          :key="error"
          color="danger"
          class="my-4 text-xs"
          size="sm"
          variant="solid-light"
          icon
        >
          {{ error }}
        </VcAlert>

        <!-- Form actions -->
        <div class="mt-5 w-1/2 self-center lg:self-auto">
          <VcButton
            :disabled="!meta.dirty || !meta.valid || meta.pending"
            :loading="isSubmitting"
            type="submit"
            class="w-full lg:w-48"
          >
            {{ $t("common.buttons.update") }}
          </VcButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { whenever } from "@vueuse/core";
import { useField, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, ref as yupRef, string } from "yup";
import { useIdentityErrorTranslator, usePageHead } from "@/core/composables";
import { PasswordTips, ProfileUpdateSuccessDialog, usePasswordRequirements, useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import type { IdentityErrorType } from "@/core/api/graphql/types";

const { t } = useI18n();
const { user, updateUser, changePassword } = useUser();
const { passwordRequirements, fetchPasswordRequirements } = usePasswordRequirements();
const { openPopup } = usePopup();

usePageHead({
  title: computed(() => t("pages.account.profile.meta.title")),
});

const validationSchema = toTypedSchema(
  object({
    firstName: string().required().max(64),
    lastName: string().required().max(64),
    email: string(),
    oldPassword: string(),
    newPassword: string().when("oldPassword", {
      is: (value: string) => !!value,
      then: (stringSchema) =>
        stringSchema
          .required()
          .notOneOf([yupRef("oldPassword")], t("shared.account.change_password_form.errors.password_new_same_old")),
    }),
    confirmNewPassword: string().when("oldPassword", {
      is: (value: string) => !!value,
      then: (stringSchema) =>
        stringSchema.required().oneOf([yupRef("newPassword")], t("identity_error.PasswordMismatch")),
    }),
  })
);

const initialValues = computed(() => ({
  firstName: user.value.contact?.firstName,
  lastName: user.value.contact?.lastName,
  email: user.value.email,
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
}));

const { errors, isSubmitting, meta, handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues,
});

const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: email } = useField<string>("email");
const { value: oldPassword } = useField<string>("oldPassword");
const { value: newPassword } = useField<string>("newPassword");
const { value: confirmNewPassword } = useField<string>("confirmNewPassword");

const commonErrors = ref<string[]>([]);
const showErrors = (responseErrors: IdentityErrorType[]) => {
  responseErrors.forEach((error) => {
    const errorDescription = getIdentityErrorTranslation(error);

    if (errorDescription) {
      commonErrors.value.push(errorDescription);
    }
  });
};

const getIdentityErrorTranslation = useIdentityErrorTranslator();

const onSubmit = handleSubmit(async (data) => {
  const results: boolean[] = [];
  commonErrors.value = [];

  if (data.newPassword && data.oldPassword) {
    const userPasswordUpdateResult = await changePassword({
      userId: user.value.id,
      newPassword: data.newPassword,
      oldPassword: data.oldPassword,
    });

    results.push(userPasswordUpdateResult.succeeded);
    if (userPasswordUpdateResult.errors?.length) {
      showErrors(userPasswordUpdateResult.errors);
    }
  }

  if (
    (data.firstName && initialValues.value.firstName !== data.firstName) ||
    (data.lastName && initialValues.value.lastName !== data.lastName)
  ) {
    const userDataUpdateResult = await updateUser({
      firstName: data.firstName!,
      lastName: data.lastName!,
    });

    results.push(userDataUpdateResult.succeeded);

    if (userDataUpdateResult.errors?.length) {
      showErrors(userDataUpdateResult.errors);
    }
  }

  if (results.every((item) => item)) {
    resetForm();
    commonErrors.value = [];
    openPopup({
      component: ProfileUpdateSuccessDialog,
    });
  }
});

whenever(
  () => !oldPassword.value,
  () => {
    newPassword.value = "";
    confirmNewPassword.value = "";
  }
);

if (!passwordRequirements.value) {
  fetchPasswordRequirements();
}
</script>
