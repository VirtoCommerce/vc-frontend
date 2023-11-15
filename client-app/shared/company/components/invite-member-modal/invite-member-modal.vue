<template>
  <VcPopup
    ref="popupComponent"
    :title="$t('shared.account.invite_member_dialog.title')"
    modal-width="sm:max-w-[38rem]"
    is-mobile-fullscreen
  >
    <VcAlert v-if="commonErrors.length" color="danger" size="sm" variant="solid-light" class="mx-6 mt-5 sm:mx-5">
      <p v-for="error in commonErrors" :key="error">{{ error }}</p>
    </VcAlert>

    <form class="h-full space-y-4 p-6 py-5 sm:border-b sm:p-5">
      <VcSelect
        v-model="roleId"
        :items="roles"
        :label="$t('shared.account.invite_member_dialog.role_label')"
        :placeholder="$t('shared.account.invite_member_dialog.role_placeholder')"
        :disabled="loading"
        :error="!!errors.roleId"
        :message="errors.roleId"
        text-field="normalizedName"
        value-field="id"
        required
      />

      <VcTextarea
        v-model="emails"
        :label="$t('shared.account.invite_member_dialog.emails_label')"
        :placeholder="$t('shared.account.invite_member_dialog.emails_placeholder')"
        :disabled="loading"
        :message="errors.emails"
        :error="!!errors.emails"
        :rows="2"
        required
      />

      <VcTextarea
        v-model="message"
        :label="$t('shared.account.invite_member_dialog.message_label')"
        :placeholder="$t('common.placeholders.enter_value')"
        :disabled="loading"
        :max-length="1000"
        :message="errors.message"
        :error="!!errors.message"
        rows="3"
      />
    </form>

    <template #actions="{ close }">
      <VcButton :disabled="loading" class="w-full sm:w-auto" color="secondary" variant="outline" @click="close">
        {{ $t("shared.account.invite_member_dialog.cancel_button") }}
      </VcButton>

      <VcButton :disabled="!meta.valid" :loading="loading" class="w-full sm:w-auto" @click="send">
        {{ $t("shared.account.invite_member_dialog.send_button") }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { string } from "yup";
import { useIdentityErrorTranslator } from "@/core/composables";
import { B2B_ROLES } from "@/core/constants";
import { globals } from "@/core/globals";
import { useUser } from "@/shared/account";
import { useNotifications } from "@/shared/notification";
import { VcPopup } from "@/ui-kit/components";
import { parseEmails } from "./emails";

interface IEmits {
  (e: "result", succeed: boolean): void;
}

const emit = defineEmits<IEmits>();

const MAX_INVITED_CONTACTS_COUNT = 200;
const MAX_EMAIL_LENGTH = 120;

const popupComponent = shallowRef<InstanceType<typeof VcPopup> | null>(null);
const loading = ref(false);
const commonErrors = ref<string[]>([]);

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

function normalizeEmails(emailAddresses: string[]): string[] {
  return [...new Set(emailAddresses.map((email: string) => email.toLowerCase()))];
}

const { value: roleId } = useField<string>("roleId", toTypedSchema(string().required()));
const { value: message } = useField<string>("message", toTypedSchema(string().max(1000)));
const { value: emails } = useField<string>(
  "emails",
  toTypedSchema(
    string()
      .required()
      .test(
        "emails-quantity",
        t("shared.account.invite_member_dialog.emails_quantity_exceeded", { maxValue: MAX_INVITED_CONTACTS_COUNT }),
        (value: string | undefined) => {
          const emailAddresses = parseEmails(value);
          return emailAddresses.length <= MAX_INVITED_CONTACTS_COUNT;
        },
      )
      .test(
        "email-length",
        t("shared.account.invite_member_dialog.email_length_exceeded", { maxValue: MAX_EMAIL_LENGTH }),
        (value: string | undefined) => {
          const emailAddresses = parseEmails(value);
          return emailAddresses.every((emailAddress) => emailAddress.value.length <= MAX_EMAIL_LENGTH);
        },
      )
      .test(
        "every-valid",
        ({ value }) => {
          return (
            "invalid emails: " +
            parseEmails(value as string)
              .filter((el) => !el.isValid)
              .map((el) => el.value)
              .join("; ")
          );
        },
        (value) => parseEmails(value).every((el) => el.isValid),
      ),
  ),
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
    emails: normalizeEmails(
      parseEmails(data.emails)
        .filter((el) => el.isValid, [])
        .map((el) => el.value),
    ),
    message: data.message.trim(),
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
