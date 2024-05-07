<template>
  <!-- Initialization Error -->
  <p v-if="initializationError" class="text-center font-bold text-danger md:text-left">
    {{ initializationError }}
  </p>

  <!-- Main -->
  <div v-else-if="initialized" class="text-center md:pb-4 md:pt-10">
    <VcImage src="/static/images/payment/paysafecard.webp" alt="paysafecard" class="mb-2 inline-block md:mb-3" lazy />

    <p v-html-safe="$t('shared.payment.redirection.text', [$t('shared.payment.redirection.pay_now_button')])" />

    <VcButton
      :title="redirectUrl ? undefined : $t('shared.payment.redirection.errors.missing_link')"
      :disabled="!redirectUrl"
      class="mt-3 w-full md:mt-12 md:w-auto"
      @click="redirect"
    >
      {{ $t("shared.payment.redirection.pay_now_button") }}
    </VcButton>
  </div>

  <!-- Loader -->
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment } from "@/core/api/graphql";
import { PaymentActionType } from "../types";
import type { CustomerOrderType } from "@/core/api/graphql/types";

interface IProps {
  order: CustomerOrderType;
  disabled?: boolean;
}

const props = defineProps<IProps>();

const initialized = ref(false);
const initializationError = ref<string>();
const redirectUrl = ref<string>();

const { t } = useI18n();

async function initPayment() {
  const { isSuccess, paymentActionType, actionRedirectUrl, errorMessage } = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
  });

  if (paymentActionType !== PaymentActionType[PaymentActionType.Redirection]) {
    initializationError.value = t("shared.payment.redirection.errors.incorrect_payment_method");
    return;
  }

  if (isSuccess) {
    redirectUrl.value = actionRedirectUrl;
    initialized.value = true;
  } else {
    initializationError.value = errorMessage;
  }
}

function redirect() {
  if (redirectUrl.value) {
    location.href = redirectUrl.value;
  }
}

initPayment();
</script>
