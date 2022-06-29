<template>
  <!-- Initialization Error -->
  <p v-if="initializationError" class="font-bold text-center md:text-left text-[color:var(--color-danger)]">
    {{ initializationError }}
  </p>

  <!-- Main -->
  <div v-else-if="initialized" class="text-center md:pt-10 md:pb-4">
    <VcImage src="/static/images/payment/paysafecard.png" alt="paysafecard" class="inline-block mb-2 md:mb-3" lazy />

    <p v-html="$t('shared.payment.redirection.text', [$t('shared.payment.redirection.pay_now_button')])" />

    <VcButton
      :title="redirectUrl ? null : $t('shared.payment.redirection.errors.missing_link')"
      :is-disabled="!redirectUrl"
      class="uppercase w-full md:w-52 mt-3 md:mt-12"
      @click="redirect"
    >
      {{ $t("shared.payment.redirection.pay_now_button") }}
    </VcButton>
  </div>

  <!-- Loader -->
  <div v-else class="flex items-center gap-2">
    <VcLoader class="inline-block h-6 w-6 text-[color:var(--color-primary)]" />

    <span class="font-extrabold animate-pulse">
      {{ $t("shared.payment.authorize_net.loading_text") }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import { CustomerOrderType } from "@/xapi/types";
import { initializePayment } from "@/xapi/graphql/cart";
import { PaymentActionType } from "@/shared/payment";
import { useI18n } from "vue-i18n";

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
