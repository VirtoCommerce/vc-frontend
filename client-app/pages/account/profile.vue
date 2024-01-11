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

        <VcAlert
          v-for="error in translatedErrors"
          :key="error.code"
          color="danger"
          class="my-4 text-xs"
          size="sm"
          variant="solid-light"
          icon
        >
          {{ error.translation }}
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
import { useField, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, string } from "yup";
import { useErrorsTranslator, usePageHead } from "@/core/composables";
import { ProfileUpdateSuccessDialog, useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import type { IdentityErrorType } from "@/core/api/graphql/types";

const { t } = useI18n();
const { user, updateUser } = useUser();
const { openPopup } = usePopup();

const apiErrors = ref<IdentityErrorType[]>();
const { translatedErrors } = useErrorsTranslator("identity_error", apiErrors);

usePageHead({
  title: computed(() => t("pages.account.profile.meta.title")),
});

const validationSchema = toTypedSchema(
  object({
    firstName: string().required().max(64),
    lastName: string().required().max(64),
    email: string(),
  }),
);

const initialValues = computed(() => ({
  firstName: user.value.contact?.firstName,
  lastName: user.value.contact?.lastName,
  email: user.value.email,
}));

const { errors, isSubmitting, meta, handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues,
});

const { value: firstName } = useField<string>("firstName");
const { value: lastName } = useField<string>("lastName");
const { value: email } = useField<string>("email");

const onSubmit = handleSubmit(async (data) => {
  const results: boolean[] = [];
  apiErrors.value = [];
  if (
    (data.firstName && initialValues.value.firstName !== data.firstName) ||
    (data.lastName && initialValues.value.lastName !== data.lastName)
  ) {
    const userDataUpdateResult = await updateUser({
      firstName: data.firstName!,
      lastName: data.lastName!,
    });

    results.push(userDataUpdateResult.succeeded);

    apiErrors.value = userDataUpdateResult.errors;
  }

  if (results.every((item) => item)) {
    resetForm();
    apiErrors.value = [];
    openPopup({
      component: ProfileUpdateSuccessDialog,
    });
  }
});
</script>
