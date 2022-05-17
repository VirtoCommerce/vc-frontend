<template>
  <div class="bg-gray-100 flex-grow pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation />
        </div>

        <!-- Second column-->
        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="flex justify-between items-center mx-5 md:mx-0">
            <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.account.profile.title'" />
          </div>

          <div
            class="flex flex-col bg-white shadow-sm p-6 md:rounded md:border polygon-bg [--polygon-bg-position:right_bottom_-180px]"
          >
            <form @submit.prevent="onSubmit" class="lg:w-1/2 flex flex-col">
              <!-- Errors block -->
              <VcAlert v-if="updateProfileError" class="mb-2" icon text type="error">
                <span v-t="'pages.account.profile.update_error_alert'" />
              </VcAlert>

              <VcInput
                v-model="firstName"
                :label="$t('pages.account.profile.first_name_label')"
                :placeholder="$t('pages.account.profile.first_name_placeholder')"
                :is-disabled="isSubmitting"
                :error-message="errors.firstName"
                name="firstName"
                class="mb-5"
                is-required
              />

              <VcInput
                v-model="lastName"
                :label="$t('pages.account.profile.last_name_label')"
                :placeholder="$t('pages.account.profile.last_name_placeholder')"
                :is-disabled="isSubmitting"
                :error-message="errors.lastName"
                name="lastName"
                class="mb-5"
                is-required
              />

              <VcInput
                :model-value="email"
                :label="$t('pages.account.profile.email_label')"
                :placeholder="$t('pages.account.profile.email_placeholder')"
                name="email"
                class="mb-5"
                is-disabled
              />

              <div class="flex items-center my-5">
                <svg width="54" height="54" class="-ml-0.5 mr-2 text-[color:var(--color-primary)]">
                  <use href="/static/images/polygon-key.svg#main" />
                </svg>

                <h3
                  class="text-gray-800 text-xl font-extrabold uppercase"
                  v-t="'pages.account.profile.change_password_title'"
                />
              </div>

              <VcInput
                v-model="oldPassword"
                :label="$t('pages.account.profile.old_password_label')"
                :placeholder="$t('pages.account.profile.old_password_placeholder')"
                :is-disabled="isSubmitting"
                :error-message="errors.oldPassword"
                type="password"
                name="oldPassword"
                class="mb-5"
              />

              <VcInput
                :model-value="newPassword"
                :label="$t('pages.account.profile.new_password_label')"
                :placeholder="$t('pages.account.profile.new_password_placeholder')"
                :is-disabled="isSubmitting"
                :is-required="!!oldPassword"
                :error-message="errors.newPassword"
                type="password"
                name="newPassword"
                class="mb-5"
                @update:model-value="oldPassword ? (newPassword = $event.trim()) : null"
              />

              <VcInput
                :model-value="confirmNewPassword"
                :label="$t('pages.account.profile.confirm_new_password_label')"
                :placeholder="$t('pages.account.profile.confirm_new_password_placeholder')"
                :is-disabled="isSubmitting"
                :is-required="!!oldPassword"
                :error-message="errors.confirmNewPassword"
                type="password"
                name="confirmNewPassword"
                class="mb-5"
                @update:model-value="oldPassword ? (confirmNewPassword = $event.trim()) : null"
              />

              <!-- Form actions -->
              <div class="mt-5 w-1/2 self-center lg:self-auto">
                <VcButton
                  :is-disabled="!meta.dirty || !meta.valid || meta.pending"
                  :is-waiting="isSubmitting"
                  size="lg"
                  class="uppercase w-full lg:w-48"
                  is-submit
                >
                  {{ $t("pages.account.profile.update_button") }}
                </VcButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcAlert, VcButton, VcInput } from "@/components";
import { AccountNavigation, ProfileUpdateSuccessDialog, useUser } from "@/shared/account";
import { computed, Ref, ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { usePopup } from "@/shared/popup";
import { useI18n } from "vue-i18n";
import { whenever } from "@vueuse/core";

const { t } = useI18n();
const { me, updateUser, changePassword } = useUser();
const { openPopup } = usePopup();

const updateProfileError: Ref<boolean> = ref(false);

const validationSchema = yup.object({
  firstName: yup.string().label(t("pages.account.profile.first_name_label")).required().max(64),
  lastName: yup.string().label(t("pages.account.profile.last_name_placeholder")).required().max(64),
  email: yup.string().label(t("pages.account.profile.email_placeholder")),
  oldPassword: yup.string().label(t("pages.account.profile.old_password_label")),
  newPassword: yup
    .string()
    .label(t("pages.account.profile.new_password_label"))
    .when("oldPassword", {
      is: (value: string) => !!value,
      then: yup
        .string()
        .required()
        .notOneOf([yup.ref("oldPassword")], t("pages.account.profile.errors.password_new_same_old")),
    }),
  confirmNewPassword: yup
    .string()
    .label(t("pages.account.profile.confirm_new_password_label"))
    .when("oldPassword", {
      is: (value: string) => !!value,
      then: yup
        .string()
        .required()
        .oneOf([yup.ref("newPassword")], t("pages.account.profile.errors.passwords_do_not_match")),
    }),
});

const initialValues = computed(() => ({
  firstName: me.value.contact?.firstName,
  lastName: me.value.contact?.lastName,
  email: me.value.email,
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

  // updating user data
  if (initialValues.value.firstName !== data.firstName || initialValues.value.lastName !== data.lastName) {
    const userDataUpdateResult = await updateUser({
      firstName: data.firstName!,
      lastName: data.lastName!,
    });

    results.push(userDataUpdateResult.succeeded);
  }

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
