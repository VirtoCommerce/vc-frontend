<template>
  <div>
    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between md:mx-0">
      <h2 v-t="'pages.account.profile.title'" class="text-3xl font-bold uppercase text-gray-800" />
    </div>

    <div
      class="polygon-bg flex flex-col bg-white p-6 shadow-sm [--polygon-bg-position:right_bottom_-180px] md:rounded md:border"
    >
      <form class="flex flex-col lg:w-1/2" @submit.prevent="onSubmit">
        <!-- Errors block -->
        <VcAlert v-if="updateProfileError" class="mb-2" color="danger" icon>
          <span v-t="'pages.account.profile.update_error_alert'" />
        </VcAlert>

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
          :label="$t('pages.account.profile.old_password_label')"
          :placeholder="$t('pages.account.profile.old_password_placeholder')"
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
          :label="$t('pages.account.profile.new_password_label')"
          :placeholder="$t('pages.account.profile.new_password_placeholder')"
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
          :label="$t('pages.account.profile.confirm_new_password_label')"
          :placeholder="$t('pages.account.profile.confirm_new_password_placeholder')"
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
import { usePageHead } from "@/core/composables";
import { ProfileUpdateSuccessDialog, useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";

const { t } = useI18n();
const { user, updateUser, changePassword } = useUser();
const { openPopup } = usePopup();

usePageHead({
  title: computed(() => t("pages.account.profile.meta.title")),
});

const updateProfileError = ref<boolean>(false);

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
          .notOneOf([yupRef("oldPassword")], t("pages.account.profile.errors.password_new_same_old")),
    }),
    confirmNewPassword: string().when("oldPassword", {
      is: (value: string) => !!value,
      then: (stringSchema) =>
        stringSchema
          .required()
          .oneOf([yupRef("newPassword")], t("pages.account.profile.errors.passwords_do_not_match")),
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

const { errors, isSubmitting, meta, handleSubmit, resetForm, setFieldError } = useForm({
  validationSchema,
  initialValues,
});

const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: email } = useField<string>("email");
const { value: oldPassword } = useField<string>("oldPassword");
const { value: newPassword } = useField<string>("newPassword");
const { value: confirmNewPassword } = useField<string>("confirmNewPassword");

const onSubmit = handleSubmit(async (data) => {
  const results: boolean[] = [];

  updateProfileError.value = false;

  // updating user password
  if (oldPassword.value) {
    const userPasswordUpdateResult = await changePassword(data.oldPassword!, data.newPassword!);

    results.push(userPasswordUpdateResult.succeeded);

    userPasswordUpdateResult.errors?.forEach(({ code, description }) => {
      if (code === "password_mismatch") {
        setFieldError("oldPassword", t("pages.account.profile.errors.password_mismatch"));
      } else if (description) {
        setFieldError("newPassword", description); // TODO: Localize all messages
      }
    });
  }

  // updating user data
  if (initialValues.value.firstName !== data.firstName || initialValues.value.lastName !== data.lastName) {
    const userDataUpdateResult = await updateUser({
      firstName: data.firstName!,
      lastName: data.lastName!,
    });

    results.push(userDataUpdateResult.succeeded);
  }

  if (results.every((item) => item)) {
    resetForm();
    openPopup({
      component: ProfileUpdateSuccessDialog,
    });
  } else {
    updateProfileError.value = true;
  }
});

whenever(
  () => !oldPassword.value,
  () => {
    newPassword.value = "";
    confirmNewPassword.value = "";
  }
);
</script>
