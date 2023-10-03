<template>
  <!-- Initialization Error -->
  <p v-if="initializationError" class="text-center font-bold text-[color:var(--color-danger)] md:text-left">
    {{ initializationError }}
  </p>

  <!-- Bank card form -->
  <div v-else-if="initialized">
    <div class="flex flex-col xl:flex-row">
      <BankCardForm
        v-model="bankCardData"
        v-model:valid="isValidBankCard"
        :errors="bankCardErrors"
        :disabled="loading"
        class="xl:w-2/3"
        @submit="sendPaymentData"
      />

      <div class="mt-5 flex gap-3 pt-0.5 xl:ml-6 xl:w-1/3 xl:gap-4">
        <svg width="70" height="45" class="flex shrink-0 rounded border border-gray-200">
          <use href="/static/images/payment/methods/visa.svg#main" />
        </svg>

        <svg width="70" height="45" class="flex shrink-0 rounded border border-gray-200">
          <use href="/static/images/payment/methods/mastercard.svg#main" />
        </svg>

        <svg width="70" height="45" class="flex shrink-0 rounded border border-gray-200">
          <use href="/static/images/payment/methods/maestro.svg#main" />
        </svg>
      </div>
    </div>

    <div class="mt-6 flex flex-col items-center gap-x-6 gap-y-4 md:flex-row xl:mt-8">
      <p class="text-center text-sm text-gray-500 md:text-left">
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
        :disabled="!isValidBankCard || disabled"
        :loading="loading"
        class="flex-1 md:order-first md:flex-none"
        @click="sendPaymentData"
      >
        {{ $t("shared.payment.authorize_net.pay_now_button") }}
      </VcButton>
    </div>
  </div>

  <!-- Loader -->
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">
import { clone } from "lodash";
import { computed, ref, shallowRef, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment } from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { Logger } from "@/core/utilities";
import BankCardForm from "../components/bank-card-form.vue";
import { useAuthorizeNet } from "../composables/useAuthorizeNet";
import { PaymentActionType } from "../types";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import type { BankCardErrorsType, BankCardType } from "@/shared/payment";

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

const ga = useGoogleAnalytics();
const { t } = useI18n();
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

  if (paymentActionType !== PaymentActionType[PaymentActionType.PreparedForm]) {
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

      case "E_WC_08":
        bankCardErrors.value.year = t("shared.payment.authorize_net.errors.expiration_date");
        break;

      case "E_WC_15":
        bankCardErrors.value.securityCode = t("shared.payment.authorize_net.errors.security_code");
        break;

      case "E_WC_17":
        bankCardErrors.value.cardholderName = t("shared.payment.authorize_net.errors.cardholder_name");
        break;

      default:
        emit("fail", text);
    }

    // https://developer.authorize.net/api/reference/features/acceptjs.html#Appendix_Error_Codes
    Logger.error(`[Authorize.net][${code}]: ${text}`);
  });
}

async function pay(opaqueData: Accept.OpaqueData) {
  const {
    id: orderId,
    inPayments: [{ id: paymentId }],
  } = props.order;

  const { isSuccess, errorMessage } = await sendOpaqueData({ orderId, paymentId, opaqueData });

  if (isSuccess) {
    emit("success");

    /**
     * Send Google Analytics purchase event.
     */
    ga.purchase(props.order);
  } else {
    emit("fail", errorMessage);
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
      await pay(response.opaqueData);
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
