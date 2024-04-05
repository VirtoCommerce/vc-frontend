<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.account.profile.title") }}
    </VcTypography>

    <VcWidget size="lg" class="polygon-bg [--polygon-bg-position:right_bottom_-180px]">
      <form class="flex flex-col lg:w-1/2" @submit.prevent="onSubmit">
        <VcInput
          v-model="firstName"
          :label="$t('common.labels.first_name')"
          :placeholder="$t('common.placeholders.first_name')"
          :disabled="isSubmitting"
          :maxlength="MAX_NAME_LENGTH"
          :message="errors.firstName"
          :error="!!errors.firstName"
          name="firstName"
          class="mb-5"
          required
        />

        <VcInput
          v-model="lastName"
          :label="$t('common.labels.last_name')"
          :placeholder="$t('common.placeholders.first_name')"
          :disabled="isSubmitting"
          :maxlength="MAX_NAME_LENGTH"
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
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, string } from "yup";
import { useErrorsTranslator, usePageHead } from "@/core/composables";
import { ProfileUpdateSuccessModal, useUser } from "@/shared/account";
import { useModal } from "@/shared/modal";
import type { IdentityErrorType } from "@/core/api/graphql/types";

const MAX_NAME_LENGTH = 64;

const { t } = useI18n();
const { user, updateUser } = useUser();
const { openModal } = useModal();

const apiErrors = ref<IdentityErrorType[]>();
const { translatedErrors } = useErrorsTranslator("identity_error", apiErrors);

usePageHead({
  title: computed(() => t("pages.account.profile.meta.title")),
});

const validationSchema = toTypedSchema(
  object({
    firstName: string().trim().required().max(MAX_NAME_LENGTH),
    lastName: string().trim().required().max(MAX_NAME_LENGTH),
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
  const trimmedFirstName = data.firstName.trim();
  const trimmedLastName = data.lastName.trim();

  const results: boolean[] = [];
  apiErrors.value = [];
  if (initialValues.value.firstName !== trimmedFirstName || initialValues.value.lastName !== trimmedLastName) {
    const userDataUpdateResult = await updateUser({ firstName: trimmedFirstName, lastName: trimmedLastName });

    results.push(userDataUpdateResult.succeeded);

    apiErrors.value = userDataUpdateResult.errors;
  }

  if (results.every((item) => item)) {
    resetForm();
    apiErrors.value = [];
    openModal({
      component: ProfileUpdateSuccessModal,
    });
  }
});
</script>
