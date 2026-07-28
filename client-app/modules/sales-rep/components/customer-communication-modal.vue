<template>
  <VcModal
    ref="modalComponent"
    :title="t('sales_rep.communication.title')"
    class="customer-communication-modal"
    is-mobile-fullscreen
    dividers
  >
    <p class="customer-communication-modal__subtitle">
      {{ t("sales_rep.communication.subtitle", { organization: organizationName }) }}
    </p>

    <form class="customer-communication-modal__form" @submit.prevent>
      <VcInput
        v-model="title"
        :label="t('sales_rep.communication.title_label')"
        :placeholder="t('common.placeholders.enter_value')"
        :disabled="loading"
        :maxlength="128"
        :message="errors.title"
        :error="!!errors.title"
      />

      <VcTextarea
        v-model="message"
        :label="t('sales_rep.communication.message_label')"
        :placeholder="t('common.placeholders.enter_value')"
        :disabled="loading"
        :max-length="1000"
        :message="errors.message"
        :error="!!errors.message"
        rows="4"
        required
      />

      <fieldset>
        <VcLabel required class="customer-communication-modal__channels-label">
          {{ t("sales_rep.communication.channels_label") }}
        </VcLabel>

        <div class="customer-communication-modal__channels">
          <VcCheckbox v-model="sendEmail" :disabled="loading">{{
            t("sales_rep.communication.email_label")
          }}</VcCheckbox>

          <VcCheckbox v-model="sendPush" :disabled="loading">{{ t("sales_rep.communication.push_label") }}</VcCheckbox>
        </div>
      </fieldset>
    </form>

    <template #actions="{ close }">
      <VcButton :disabled="loading" color="secondary" variant="outline" @click="close">
        {{ t("sales_rep.communication.cancel_button") }}
      </VcButton>

      <VcButton :disabled="!meta.valid || !channelSelected" :loading="loading" @click="send">
        {{ t("sales_rep.communication.send_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { string } from "yup";
import { useNotifications } from "@/shared/notification";
import { VcModal } from "@/ui-kit/components";
import { useSalesRepCommunication } from "../composables/useSalesRepCommunication";

interface IProps {
  organizationId: string;
  organizationName: string;
}

const props = defineProps<IProps>();

const { t, te } = useI18n();
const notifications = useNotifications();
const { sendCommunication, loading } = useSalesRepCommunication();

const modalComponent = useTemplateRef<InstanceType<typeof VcModal>>("modalComponent");

const sendEmail = ref(false);
const sendPush = ref(false);
const channelSelected = computed(() => sendEmail.value || sendPush.value);

const { errors, meta, handleSubmit } = useForm({
  initialValues: { title: "", message: "" },
});

const { value: title } = useField<string>("title", toTypedSchema(string().trim().max(128)));
const { value: message } = useField<string>("message", toTypedSchema(string().trim().required().max(1000)));

const send = handleSubmit(async (data) => {
  const result = await sendCommunication({
    organizationId: props.organizationId,
    sendEmail: sendEmail.value,
    sendPush: sendPush.value,
    title: data.title.trim() || undefined,
    message: data.message.trim(),
  });

  // Map the backend's stable warning codes to localized messages (unknown codes fall back to a generic note).
  const warnings = result.warnings.map((code) =>
    te(`sales_rep.communication.warnings.${code}`)
      ? t(`sales_rep.communication.warnings.${code}`)
      : t("sales_rep.communication.warnings.generic"),
  );

  if (result.succeeded) {
    modalComponent.value?.close();

    if (warnings.length > 0) {
      // Partial success — at least one channel delivered, but tell the rep what didn't.
      notifications.warning({
        text: `${t("sales_rep.communication.partial_success_text")} ${warnings.join(" ")}`,
        duration: 10000,
        single: true,
      });
    } else {
      notifications.success({
        text: t("sales_rep.communication.success_text"),
        duration: 10000,
        single: true,
      });
    }
  } else {
    // Nothing was sent — surface the specific reason(s) when we have them, else a generic error.
    notifications.error({
      text: warnings.length > 0 ? warnings.join(" ") : t("sales_rep.communication.error_text"),
      duration: 10000,
      single: true,
    });
  }
});
</script>

<style lang="scss">
.customer-communication-modal {
  &__form {
    @apply space-y-4;
  }

  &__subtitle {
    @apply mb-4 text-sm text-neutral-500 [word-break:break-word];
  }

  &__channels-label {
    @apply mb-2;
  }

  &__channels {
    @apply flex flex-col gap-2;
  }
}
</style>
