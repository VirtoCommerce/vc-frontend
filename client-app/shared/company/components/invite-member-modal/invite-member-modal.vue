<template>
  <VcModal ref="modalComponent" :title="$t('shared.account.invite_member_modal.title')" is-mobile-fullscreen dividers>
    <VcAlert v-if="commonErrors.length" color="danger" size="sm" variant="solid-light" class="mb-4">
      <p v-for="error in commonErrors" :key="error">{{ error }}</p>
    </VcAlert>

    <form class="space-y-4">
      <VcSelect
        v-model="roleId"
        :items="roles"
        :label="$t('shared.account.invite_member_modal.role_label')"
        :placeholder="$t('shared.account.invite_member_modal.role_placeholder')"
        :disabled="loading"
        :error="!!errors.roleId"
        :message="errors.roleId"
        text-field="normalizedName"
        value-field="id"
        required
      />

      <VcTextarea
        v-model="emails"
        :label="$t('shared.account.invite_member_modal.emails_label')"
        :placeholder="$t('shared.account.invite_member_modal.emails_placeholder')"
        :disabled="loading"
        :message="errors.emails"
        :error="!!errors.emails"
        :rows="2"
        required
        @input="clearApiErrors"
      />

      <VcTextarea
        v-model="message"
        :label="$t('shared.account.invite_member_modal.message_label')"
        :placeholder="$t('common.placeholders.enter_value')"
        :disabled="loading"
        :max-length="1000"
        :message="errors.message"
        :error="!!errors.message"
        rows="3"
      />
    </form>

    <template #actions="{ close }">
      <VcButton :disabled="loading" color="secondary" variant="outline" @click="close">
        {{ $t("shared.account.invite_member_modal.cancel_button") }}
      </VcButton>

      <VcButton :disabled="!meta.valid" :loading="loading" @click="send">
        {{ $t("shared.account.invite_member_modal.send_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { string } from "yup";
import { useErrorsTranslator } from "@/core/composables";
import { B2B_ROLES } from "@/core/constants";
import { globals } from "@/core/globals";
import { useUser } from "@/shared/account";
import { useNotifications } from "@/shared/notification";
import { VcModal } from "@/ui-kit/components";
import { getInvalidEmails, parseEmails, normalizeEmails } from "./emails";
import type { IdentityErrorInfoType } from "@/core/api/graphql/types";

interface IEmits {
  (e: "result", succeed: boolean): void;
}

const emit = defineEmits<IEmits>();

const MAX_INVITED_CONTACTS_COUNT = 200;
const MAX_EMAIL_LENGTH = 120;

const modalComponent = useTemplateRef<InstanceType<typeof VcModal>>("modalComponent");
const loading = ref(false);
const commonErrors = ref<string[]>([]);

const { t } = useI18n();
const { organization, inviteUser } = useUser();
const router = useRouter();
const notifications = useNotifications();
const { translate } = useErrorsTranslator<IdentityErrorInfoType>("identity_error");

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

const { value: roleId } = useField<string>("roleId", toTypedSchema(string().required()));
const { value: message } = useField<string>("message", toTypedSchema(string().max(1000)));
const { value: emails } = useField<string>(
  "emails",
  toTypedSchema(
    string()
      .required()
      .test(
        "emails-quantity",
        t("shared.account.invite_member_modal.emails_quantity_exceeded", { maxValue: MAX_INVITED_CONTACTS_COUNT }),
        (value) => {
          const emailAddresses = parseEmails(value);
          return emailAddresses.length <= MAX_INVITED_CONTACTS_COUNT;
        },
      )
      .test(
        "email-length",
        t("shared.account.invite_member_modal.email_length_exceeded", { maxValue: MAX_EMAIL_LENGTH }),
        (value) => {
          const emailAddresses = parseEmails(value);
          return emailAddresses.every((emailAddress) => emailAddress.value.length <= MAX_EMAIL_LENGTH);
        },
      )
      .test(
        "every-valid",
        ({ value }) =>
          t("shared.account.invite_member_modal.invalid_emails", {
            invalidEmails: getInvalidEmails(parseEmails(value as string)),
          }),
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
    emails: normalizeEmails(parseEmails(data.emails)),
    message: data.message.trim(),
  });

  loading.value = false;

  if (result.succeeded) {
    emit("result", true);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    modalComponent.value?.close();

    notifications.success({
      text: t("shared.account.invite_member_modal.invite_successfully_text"),
      duration: 10000,
      single: true,
    });
  } else if (result.errors?.length) {
    result.errors.forEach((error) => {
      // Excluding some types of errors. Example: because email is a `UserName` (login)
      if (error.code === "DuplicateUserName") {
        return;
      }

      const errorDescription = translate(error);

      if (errorDescription) {
        commonErrors.value.push(errorDescription);
      }
    });
  }
});

function clearApiErrors(): void {
  commonErrors.value = [];
}
</script>
