<template>
  <VcLoaderOverlay v-if="initializing" fixed />

  <PaymentProcessingDatatransLightbox
    v-else-if="paymentMode === 'Lightbox'"
    :order="order"
    :transaction-id="transactionId"
    :client-script="clientScript"
    @success="emit('success')"
    @fail="(msg) => emit('fail', msg)"
  />

  <PaymentProcessingDatatransSecureFields
    v-else
    :order="order"
    :disabled="disabled"
    :initial-transaction-id="transactionId"
    :initial-client-script="clientScript"
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

  // Initialize payment to determine mode
  const { publicParameters } = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0].id,
  });

  const mode = getValue(publicParameters, "paymentMode");
  const txId = getValue(publicParameters, "transactionId");
  const script = getValue(publicParameters, "clientScript");

  // Store initialization data for both modes
  transactionId.value = txId ?? "";
  clientScript.value = script ?? "";

  if (mode === "Lightbox") {
    if (!txId || !script) {
      showError(t("shared.payment.bank_card_form.user_error_message"));
      initializing.value = false;
      emit("fail");
      return;
    }

    paymentMode.value = "Lightbox";
  }

  initializing.value = false;
});

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
      emit("fail");
    }
  } catch {
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
