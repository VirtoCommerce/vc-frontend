<template>
  <VcPopup
    :title="$t('shared.account.invite_member_dialog.title')"
    modal-width="sm:max-w-[38rem]"
    ref="popupComponent"
    is-mobile-fullscreen
  >
    <VcAlert v-if="commonErrors.length" type="error" class="mx-6 mt-5 sm:mx-5">
      <p v-for="error in commonErrors" :key="error">{{ error }}</p>
    </VcAlert>

    <form class="space-y-4 p-6 py-5 sm:p-5 sm:border-b h-full">
      <VcSelect
        v-model="roleId"
        :items="roles"
        :label="$t('shared.account.invite_member_dialog.role_label')"
        :placeholder="$t('shared.account.invite_member_dialog.role_placeholder')"
        :is-disabled="loading"
        :error-message="errors.roleId"
        text-field="normalizedName"
        value-field="id"
        size="lg"
        is-required
      />

      <VcTextarea
        v-model.trim="emails"
        :label="$t('shared.account.invite_member_dialog.emails_label')"
        :placeholder="$t('shared.account.invite_member_dialog.emails_placeholder')"
        :disabled="loading"
        :message="errors.emails"
        :error="!!errors.emails"
        :rows="2"
        required
      />

      <VcTextarea
        v-model.trim="message"
        :label="$t('shared.account.invite_member_dialog.message_label')"
        :placeholder="$t('shared.account.invite_member_dialog.message_placeholder')"
        :disabled="loading"
        :max-length="1000"
        :message="errors.message"
        :error="!!errors.message"
        rows="3"
      />
    </form>

    <template #actions="{ close }">
      <VcButton
        :is-disabled="loading"
        class="uppercase w-full sm:w-auto sm:px-10"
        kind="secondary"
        is-outline
        @click="close"
      >
        {{ $t("shared.account.invite_member_dialog.cancel_button") }}
      </VcButton>

      <VcButton
        :is-disabled="!meta.valid"
        :is-waiting="loading"
        class="uppercase w-full sm:w-auto sm:px-10"
        @click="send"
      >
        {{ $t("shared.account.invite_member_dialog.send_button") }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import globals from "@/core/globals";
import { B2B_ROLES } from "@/core/constants";
import { useIdentityErrorTranslator } from "@/core/composables";
import { useUser } from "@/shared/account";
import { useNotifications } from "@/shared/notification";

const emailsValidationPattern =
  /^([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})+([,;]|\r|\r\n|\n))*([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})+)$/;

const emit = defineEmits<{
  (e: "result", succeed: boolean): void;
}>();

const popupComponent = shallowRef<any>(null);
const loading = ref(false);
const commonErrors = ref<string[]>([]);
const maxContactsValue = ref(200);
const maxEmailLength = ref(120);

const { t } = useI18n();
const { organization, inviteUser } = useUser();
const router = useRouter();
const notifications = useNotifications();
const getIdentityErrorTranslation = useIdentityErrorTranslator();

const roles = B2B_ROLES.map((role) => {
  role.normalizedName = t("common.roles." + role.id);
  return role;
});

const { errors, meta, handleSubmit } = useForm({
  initialValues: {
    roleId: roles[0].id,
    message: "",
    emails: "",
  },
});

function getEmailAddresses(value: string | undefined): string[] {
  return value?.split(/[,;]|\r|\r\n|\n/g) || [];
}

function normalizeEmails(emailAddresses: string[]): string[] {
  return [...new Set(emailAddresses.map((email: string) => email.toLowerCase()))];
}

const { value: roleId } = useField<string>("roleId", yup.string().required());
const { value: message } = useField<string>("message", yup.string().max(1000));
const { value: emails } = useField<string>(
  "emails",
  yup
    .string()
    .test(
      "emails-quantity",
      t("shared.account.invite_member_dialog.emails_quantity_exceeded", { maxValue: maxContactsValue.value }),
      (value: string | undefined) => {
        const emailAddresses: string[] = getEmailAddresses(value);
        return emailAddresses.length <= maxContactsValue.value;
      }
    )
    .test(
      "email-length",
      t("shared.account.invite_member_dialog.email_length_exceeded", { maxValue: maxEmailLength.value }),
      (value: string | undefined) => {
        const emailAddresses: string[] = getEmailAddresses(value);
        return emailAddresses.every((emailAddress: string) => emailAddress.length <= maxEmailLength.value);
      }
    )
    .matches(emailsValidationPattern, t("common.messages.invalid_value"))
    .required()
);

const send = handleSubmit(async (data) => {
  const { storeId } = globals;

  commonErrors.value = [];
  loading.value = true;

  const result = await inviteUser({
    storeId,
    urlSuffix: router.resolve({ name: "ConfirmInvitation" }).path,
    organizationId: organization.value!.id,
    roleIds: [data.roleId],
    emails: normalizeEmails(getEmailAddresses(data.emails)),
    message: data.message,
  });

  loading.value = false;

  if (result.succeeded) {
    emit("result", true);

    popupComponent.value?.close();

    notifications.success({
      text: t("shared.account.invite_member_dialog.invite_successfully_text"),
      duration: 10000,
      single: true,
    });
  } else if (result.errors?.length) {
    result.errors.forEach((error) => {
      // Excluding some types of errors. Example: because email is a `UserName` (login)
      if (error.code === "DuplicateUserName") {
        return;
      }

      const errorDescription = getIdentityErrorTranslation(error);

      if (errorDescription) {
        commonErrors.value.push(errorDescription);
      }
    });
  }
});
</script>
