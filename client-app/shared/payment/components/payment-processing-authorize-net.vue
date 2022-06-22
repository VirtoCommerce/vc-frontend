<template>
  <!-- Initialization Error -->
  <p v-if="initializationError" class="font-bold text-center md:text-left text-[color:var(--color-danger)]">
    {{ initializationError }}
  </p>

  <!-- Bank card form -->
  <div v-else-if="initialized">
    <div class="flex flex-col xl:flex-row">
      <BankCardForm
        v-model="bankCardData"
        v-model:valid="isValidBankCard"
        :errors="bankCardErrors"
        :is-disabled="loading"
        class="xl:w-2/3"
      />

      <div class="flex xl:w-1/3 mt-6 xl:ml-6 gap-3 xl:gap-4">
        <svg width="70" height="45" class="flex shrink-0 border border-gray-200 rounded">
          <use href="/static/images/payment/methods/visa.svg#main" />
        </svg>

        <svg width="70" height="45" class="flex shrink-0 border border-gray-200 rounded">
          <use href="/static/images/payment/methods/mastercard.svg#main" />
        </svg>

        <svg width="70" height="45" class="flex shrink-0 border border-gray-200 rounded">
          <use href="/static/images/payment/methods/maestro.svg#main" />
        </svg>
      </div>
    </div>

    <div class="flex flex-col md:flex-row items-center mt-6 xl:mt-8 gap-x-6 gap-y-4">
      <p class="text-sm text-gray-500 text-center md:text-left">
        {{ $t("shared.payment.authorize_net.accept_terms_text") }}

        <router-link to="/agreement" class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]">
          {{ $t("shared.payment.authorize_net.user_agreement_link") }}
        </router-link>

        {{ $t("shared.payment.authorize_net.processing_personal_data_text") }}

        <router-link to="/policy" class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]">
          {{ $t("shared.payment.authorize_net.privacy_policy_link") }}
        </router-link>
      </p>

      <VcButton
        :is-disabled="!isValidBankCard || disabled"
        :is-waiting="loading"
        @click="sendPaymentData"
        size="lg"
        class="shrink-0 uppercase w-full md:w-60 md:order-first"
      >
        {{ $t("shared.payment.authorize_net.pay_now_button") }}
      </VcButton>
    </div>
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
import { computed, PropType, ref, shallowRef, watch, watchEffect } from "vue";
import { clone } from "lodash";
import { initializePayment } from "@/xapi/graphql/cart";
import { CustomerOrderType, KeyValueType } from "@/xapi/graphql/types";
import { BankCardType, BankCardForm, useAuthorizeNet, BankCardErrorsType, PaymentActionType } from "@/shared/payment";
import { useNotifications } from "@/shared/notification";
import { useI18n } from "vue-i18n";
import { Logger } from "@core/utilities";

const emit = defineEmits<{
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}>();

const props = defineProps({
  disabled: Boolean,

  order: {
    type: Object as PropType<CustomerOrderType>,
    required: true,
  },
});

const emptyBankCardData: BankCardType = {
  cardholderName: "",
  number: "",
  month: "",
  year: "",
  securityCode: "",
};

const initialized = ref(false);
const initializationError = ref("");
const parameters = shallowRef<KeyValueType[]>([]);
const loading = ref(false);
const isValidBankCard = ref(false);
const bankCardData = ref<BankCardType>(clone(emptyBankCardData));
const bankCardErrors = ref<BankCardErrorsType>({});

const scriptURL = computed<string>(() => parameters.value.find(({ key }) => key === "acceptJsPath")?.value ?? "");
const apiLoginID = computed<string>(() => parameters.value.find(({ key }) => key === "apiLogin")?.value ?? "");
const clientKey = computed<string>(() => parameters.value.find(({ key }) => key === "clientKey")?.value ?? "");

const { t } = useI18n();
const notifications = useNotifications();
const { loadAcceptJS, dispatchData, sendOpaqueData } = useAuthorizeNet({ scriptURL, manualScriptLoading: true });

async function initPayment() {
  const {
    isSuccess,
    paymentActionType,
    publicParameters = [],
    errorMessage = "",
  } = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
  });

  if (paymentActionType !== PaymentActionType.PreparedForm) {
    initializationError.value = t("shared.payment.authorize_net.errors.incorrect_payment_method");
    return;
  }

  if (isSuccess) {
    parameters.value = publicParameters;
    initialized.value = true;
  } else {
    initializationError.value = errorMessage;
  }
}

function showErrors(messages: Accept.Message[]) {
  messages.forEach(({ code, text }) => {
    switch (code) {
      case "E_WC_05":
        bankCardErrors.value.number = t("shared.payment.authorize_net.errors.number");
        break;

      case "E_WC_06":
        bankCardErrors.value.month = t("shared.payment.authorize_net.errors.month");
        break;

      case "E_WC_07":
        bankCardErrors.value.year = t("shared.payment.authorize_net.errors.year");
        break;

      case "E_WC_15":
        bankCardErrors.value.securityCode = t("shared.payment.authorize_net.errors.security_code");
        break;

      case "E_WC_17":
        bankCardErrors.value.cardholderName = t("shared.payment.authorize_net.errors.cardholder_name");
        break;

      case "E_WC_19":
        notifications.error({
          text: t(`shared.payment.authorize_net.errors.try_again`),
          duration: 15000,
          single: true,
        });
        break;

      default:
        notifications.error({ text, duration: 15000, single: true });
    }

    // https://developer.authorize.net/api/reference/features/acceptjs.html#Appendix_Error_Codes
    Logger.error(`[Authorize.net][${code}]: ${text}`);
  });
}

async function authorizePayment(opaqueData: Accept.OpaqueData) {
  const {
    number,
    id: orderId,
    inPayments: [{ id: paymentId }],
  } = props.order;

  const { isSuccess, errorMessage } = await sendOpaqueData({ orderId, paymentId, opaqueData });

  if (isSuccess) {
    emit("success");
  } else {
    emit("fail", errorMessage);
    Logger.error(`[Order ${number}]: ${errorMessage}`);
  }

  bankCardData.value = clone(emptyBankCardData);
}

function sendPaymentData() {
  if (!isValidBankCard.value) {
    return;
  }

  const { month, year, number: cardNumber, securityCode: cardCode, cardholderName: fullName } = bankCardData.value;
  const cardData: Accept.CardData = { cardNumber, month, year, cardCode, fullName };
  const authData: Accept.AuthData = { apiLoginID: apiLoginID.value, clientKey: clientKey.value };

  loading.value = true;

  dispatchData({ authData, cardData }, async (response: Accept.Response) => {
    if (response.messages.resultCode === "Error") {
      showErrors(response.messages.message);
    } else if (response.opaqueData) {
      await authorizePayment(response.opaqueData);
    }

    loading.value = false;
  });
}

defineExpose({
  loading,
  initialized,
  isValidBankCard,
});

initPayment();

watch(bankCardData, () => (bankCardErrors.value = {}));

watchEffect(() => {
  if (scriptURL.value) {
    loadAcceptJS();
  }
});
</script>
