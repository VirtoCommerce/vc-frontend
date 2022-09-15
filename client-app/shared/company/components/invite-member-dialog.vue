<template>
  <VcPopup
    :title="$t('shared.account.invite_member_dialog.title')"
    modal-width="sm:max-w-[38rem]"
    ref="popupComponent"
    is-mobile-fullscreen
  >
    <VcAlert v-if="errorText" type="error" class="mx-6 mt-5 sm:mx-5">
      {{ errorText }}
    </VcAlert>

    <form class="p-6 py-5 sm:p-5 sm:border-b h-full">
      <!--
      <VcSelect
        v-model="role"
        :items="roles"
        :label="$t('shared.account.invite_member_dialog.role_label')"
        :placeholder="$t('shared.account.invite_member_dialog.role_placeholder')"
        :is-disabled="loading"
        :error-message="errors.role"
        size="lg"
        class="mb-4"
        is-required
      />
      -->

      <p>
        <span class="font-bold text-gray-900">{{ $t("shared.account.invite_member_dialog.emails_label") }}</span>
        <span class="text-[color:var(--color-danger)]">*</span>
      </p>

      <VcTextArea
        v-model.trim="emails"
        :placeholder="$t('shared.account.invite_member_dialog.emails_placeholder')"
        :is-disabled="loading"
        :error-message="errors.emails"
        class="max-h-36 block"
        rows="2"
      />

      <div class="mb-4 text-xs text-[color:var(--color-danger)]">{{ errors.emails }}</div>

      <p>
        <span class="font-bold text-gray-900">{{ $t("shared.account.invite_member_dialog.message_label") }}</span>
      </p>

      <VcTextArea
        v-model.trim="message"
        :placeholder="$t('shared.account.invite_member_dialog.message_placeholder')"
        :is-disabled="loading"
        :max-length="1000"
        :error-message="errors.message"
        rows="3"
        class="max-h-48 block"
      />

      <div class="text-xs text-[color:var(--color-danger)]">{{ errors.message }}</div>
    </form>

    <template #actions="{ close }">
      <VcButton class="uppercase w-full sm:w-auto sm:px-10" kind="secondary" is-outline @click="close">
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
import { useRouter } from "vue-router";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import globals from "@/core/globals";
import { useUser } from "@/shared/account";
import { useNotifications } from "@/shared/notification";
import { useI18n } from "vue-i18n";
import _ from "lodash";

const roles = ["Organization maintainer", "Organization employee", "Purchasing agent"];
const emailsValidationPattern =
  /^([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})+([,;]|\r|\r\n|\n))*([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})+)$/;

const emit = defineEmits<{
  (e: "result", succeed: boolean): void;
}>();

const popupComponent = shallowRef<any>(null);
const loading = ref(false);
const errorText = ref("");
const maxContactsValue = ref(200);
const maxEmailLength = ref(120);

const { t } = useI18n();
const { organization, inviteUser } = useUser();
const router = useRouter();
const notifications = useNotifications();

const { errors, meta, handleSubmit } = useForm({
  initialValues: {
    role: roles[1],
    message: "",
    emails: "",
  },
});

function getEmailAddresses(value: string | undefined): string[] {
  return value?.split(/[,;]|\r|\r\n|\n/g) || [];
}

function normalizeEmails(emailAddresses: string[]): string[] {
  return [...new Set(_.map(emailAddresses, (email: string) => email.toLowerCase()))];
}

// const { value: role } = useField<string>("role", yup.string().required());
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
        return _.every(emailAddresses, (emailAddress: string) => emailAddress.length <= maxEmailLength.value);
      }
    )
    .matches(emailsValidationPattern, t("common.messages.invalid_value"))
    .required()
);

const send = handleSubmit(async (data) => {
  const { storeId } = globals;

  errorText.value = "";
  loading.value = true;

  const result = await inviteUser({
    storeId,
    urlSuffix: router.resolve({ name: "ConfirmInvitation" }).path,
    organizationId: organization.value!.id,
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
    errorText.value = result.errors
      .filter((error) => error.code !== "DuplicateUserName") // Because email is a `UserName` (login)
      .map((error) => error.description)
      .join(" ");
  }
});
</script>
