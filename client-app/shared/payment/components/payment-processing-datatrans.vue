<template>
  <VcLoaderOverlay v-if="initializing" fixed-spinner />

  <PaymentProcessingDatatransLightbox
    v-else-if="paymentMode === 'Lightbox'"
    :order="order"
    :transaction-id="transactionId"
    :client-script="clientScript"
    @success="emit('success')"
    @fail="(msg) => emit('fail', msg)"
    @reinitialize="reinitializeLightbox"
  />

  <!--
    SecureFields self-initializes (calls initializePayment again) instead of receiving
    pre-initialized props. This intentionally creates a second transaction because
    VueUse's useScriptTag composable requires an await before it is called, which only
    the child's own initializePayment provides. The first transaction is harmless —
    Datatrans only charges on authorization, and the backend overwrites payment.OuterId.
  -->
  <PaymentProcessingDatatransSecureFields
    v-else
    :order="order"
    :disabled="disabled"
    @success="emit('success')"
    @fail="(msg) => emit('fail', msg)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import { useAnalytics } from "@/core/composables";
import { useNotifications } from "@/shared/notification";
import PaymentProcessingDatatransLightbox from "./payment-processing-datatrans-lightbox.vue";
import PaymentProcessingDatatransSecureFields from "./payment-processing-datatrans-secure-fields.vue";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

interface IProps {
  order: CustomerOrderType;
  disabled?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();
const { analytics } = useAnalytics();
const notifications = useNotifications();

const initializing = ref(true);
const paymentMode = ref<string>("SecureFields");
const transactionId = ref<string>("");
const clientScript = ref<string>("");

onMounted(async () => {
  const params = new URLSearchParams(location.search);

  // Check if this is a return from Lightbox redirect (datatransTrxId in URL)
  const datatransTrxId = params.get("datatransTrxId");
  if (datatransTrxId) {
    await finalizeLightboxReturn(datatransTrxId);
    return;
  }

  // Check if this is a return from 3-D Secure (Secure Fields mode)
  // Let the SecureFields child component handle it directly
  const uppTransactionId = params.get("uppTransactionId");
  if (uppTransactionId) {
    paymentMode.value = "SecureFields";
    initializing.value = false;
    return;
  }

  await initializeLightboxPayment();
});

async function initializeLightboxPayment() {
  try {
    const { publicParameters } = await initializePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0].id,
    });

    const mode = getValue(publicParameters, "paymentMode");
    const txId = getValue(publicParameters, "transactionId");
    const script = getValue(publicParameters, "clientScript");

    transactionId.value = txId ?? "";
    clientScript.value = script ?? "";

    if (mode === "Lightbox") {
      if (!txId || !script) {
        showError(t("shared.payment.bank_card_form.user_error_message"));
        emit("fail");
        return;
      }

      paymentMode.value = "Lightbox";
    }
  } catch {
    showError(t("shared.payment.bank_card_form.user_error_message"));
    emit("fail");
  } finally {
    initializing.value = false;
  }
}

async function reinitializeLightbox() {
  // Datatrans transactionIds are single-use — after the user closes the Lightbox
  // popup, the old transactionId is consumed and cannot be reused.
  // We must create a fresh transaction for the retry.
  try {
    const { publicParameters } = await initializePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0].id,
    });

    const txId = getValue(publicParameters, "transactionId");
    const script = getValue(publicParameters, "clientScript");

    if (!txId || !script) {
      showError(t("shared.payment.bank_card_form.user_error_message"));
      emit("fail");
      return;
    }

    transactionId.value = txId;
    clientScript.value = script;
  } catch {
    showError(t("shared.payment.bank_card_form.user_error_message"));
    emit("fail");
  }
}

async function finalizeLightboxReturn(datatransTrxId: string) {
  try {
    const { isSuccess } = await authorizePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0].id,
      parameters: [
        {
          key: "datatransTrxId",
          value: datatransTrxId,
        },
      ],
    });
    if (isSuccess) {
      analytics("purchase", props.order);
      emit("success");
    } else {
      showError(t("shared.payment.bank_card_form.user_error_message"));
      emit("fail");
    }
  } catch {
    showError(t("shared.payment.bank_card_form.user_error_message"));
    emit("fail");
  } finally {
    initializing.value = false;
  }
}

function getValue(publicParameters?: KeyValueType[], key?: string) {
  return publicParameters?.find((x) => x.key === key)?.value;
}

function showError(message: string) {
  notifications.error({
    text: message,
    duration: 10000,
    single: true,
  });
}
</script>
