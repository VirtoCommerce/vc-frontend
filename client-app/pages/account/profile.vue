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
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { useErrorsTranslator, usePageHead } from "@/core/composables";
import { ProfileUpdateSuccessModal, useUser } from "@/shared/account";
import { useModal } from "@/shared/modal";
import type { IdentityErrorType } from "@/core/api/graphql/types";

const MAX_NAME_LENGTH = 64;

const { t } = useI18n();
const { user, updateUser } = useUser();
const { openModal } = useModal();

const responseErrors = ref<IdentityErrorType[]>();
const { translatedErrors } = useErrorsTranslator("identity_error", responseErrors);

usePageHead({
  title: computed(() => t("pages.account.profile.meta.title")),
});

const validationSchema = toTypedSchema(
  yup.object({
    firstName: yup.string().trim().required().max(MAX_NAME_LENGTH),
    lastName: yup.string().trim().required().max(MAX_NAME_LENGTH),
    email: yup.string(),
  }),
);

function initialValues() {
  return {
    firstName: user.value.contact?.firstName ?? "",
    lastName: user.value.contact?.lastName ?? "",
    email: user.value.email,
  };
}

const { defineField, errors, isSubmitting, meta, handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: initialValues(),
});

const [firstName] = defineField("firstName");
const [lastName] = defineField("lastName");
const [email] = defineField("email");

const onSubmit = handleSubmit(async (data) => {
  responseErrors.value = [];

  const response = await updateUser(data);

  responseErrors.value = response.errors ?? [];

  if (response.succeeded) {
    resetForm({ values: initialValues() });
    openModal({
      component: ProfileUpdateSuccessModal,
    });
  }
});
</script>
