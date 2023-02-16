<template>
  <!-- Initialization Error -->
  <p v-if="initializationError" class="text-center font-bold text-[color:var(--color-danger)] md:text-left">
    {{ initializationError }}
  </p>

  <!-- Main -->
  <div v-else-if="initialized" class="text-center md:pt-10 md:pb-4">
    <VcImage src="/static/images/payment/paysafecard.png" alt="paysafecard" class="mb-2 inline-block md:mb-3" lazy />

    <p v-html="$t('shared.payment.redirection.text', [$t('shared.payment.redirection.pay_now_button')])" />

    <VcButton
      :title="redirectUrl ? null : $t('shared.payment.redirection.errors.missing_link')"
      :is-disabled="!redirectUrl"
      class="mt-3 w-full uppercase md:mt-12 md:w-52"
      @click="redirect"
    >
      {{ $t("shared.payment.redirection.pay_now_button") }}
    </VcButton>
  </div>

  <!-- Loader -->
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PaymentActionType } from "@/shared/payment";
import { initializePayment } from "@/xapi/graphql/cart";
import { CustomerOrderType } from "@/xapi/types";

const props = defineProps({
  disabled: Boolean,

  order: {
    type: Object as PropType<CustomerOrderType>,
    required: true,
  },
});

const initialized = ref(false);
const initializationError = ref("");
const redirectUrl = ref("");

const { t } = useI18n();

async function initPayment() {
  const {
    isSuccess,
    paymentActionType,
    actionRedirectUrl = "",
    errorMessage = "",
  } = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
  });

  if (paymentActionType !== PaymentActionType.Redirection) {
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
  location.href = redirectUrl.value;
}

initPayment();
</script>
