<template>
  <!-- Initialization Error -->
  <p v-if="initializationError" class="text-center font-bold text-danger md:text-left">
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
        @submit="() => !hidePaymentButton && sendPaymentData()"
      />

      <CardLabels class="mt-5" />
    </div>

    <div class="mt-6 flex flex-col items-center gap-x-6 gap-y-4 md:flex-row xl:mt-8">
      <PaymentPolicies />

      <VcButton
        v-if="!hidePaymentButton"
        :disabled="!isValidBankCard || disabled"
        :loading="loading"
        class="flex-1 md:order-first md:flex-none"
        data-test-id="pay-now-button"
        @click="() => sendPaymentData()"
      >
        {{ $t("shared.payment.bank_card_form.pay_now_button") }}
      </VcButton>
    </div>
  </div>

  <!-- Loader -->
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">
import { clone } from "lodash-es";
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { initializeCartPayment, initializePayment } from "@/core/api/graphql";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { Logger } from "@/core/utilities";
import { useAuthorizeNet } from "@/shared/payment/composables/useAuthorizeNet";
import { PaymentActionType } from "@/shared/payment/types";
import { usePayment } from "../composables";
import PaymentPolicies from "./payment-policies.vue";
import type { IPaymentMethodEmits, IPaymentMethodParameters } from "./types";
import type {
  AuthorizePaymentResultType,
  CustomerOrderType,
  InitializeCartPaymentResultType,
  InitializePaymentResultType,
  KeyValueType,
} from "@/core/api/graphql/types";
import type { BankCardErrorsType, BankCardType } from "@/shared/payment";
import BankCardForm from "@/shared/payment/components/bank-card-form.vue";
import CardLabels from "@/shared/payment/components/card-labels.vue";

const emit = defineEmits<IPaymentMethodEmits>();
const props = defineProps<IPaymentMethodParameters>();

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

// Guards against late async init completing after the component was torn down
// (e.g. the shopper switched payment method while Accept.js was still loading).
let isActive = true;

const scriptURL = computed<string>(() => parameters.value.find(({ key }) => key === "acceptJsPath")?.value ?? "");
const apiLoginID = computed<string>(() => parameters.value.find(({ key }) => key === "apiLogin")?.value ?? "");
const clientKey = computed<string>(() => parameters.value.find(({ key }) => key === "clientKey")?.value ?? "");

const { analytics } = useAnalytics();
const { t } = useI18n();
const { loadAcceptJS, dispatchData, sendOpaqueData } = useAuthorizeNet({ scriptURL, manualScriptLoading: true });
const { registerPaymentProcessor, setCardDataValid, setCardDataInvalid } = usePayment();

async function initializeByCartOrOrder(): Promise<InitializePaymentResultType | InitializeCartPaymentResultType> {
  if (props.cart && props.payment) {
    return await initializeCartPayment({
      cartId: props.cart.id,
      paymentId: props.payment.id,
    });
  }

  if (props.order) {
    return await initializePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0].id,
    });
  }

  throw new Error("Authorize.Net payment requires either cart+payment or order context");
}

async function initPayment() {
  try {
    const { isSuccess, paymentActionType, publicParameters = [], errorMessage = "" } = await initializeByCartOrOrder();

    if (paymentActionType !== PaymentActionType[PaymentActionType.PreparedForm]) {
      initializationError.value = t("shared.payment.authorize_net.errors.incorrect_payment_method");
      return;
    }

    if (!isSuccess) {
      initializationError.value = errorMessage;
      return;
    }

    parameters.value = publicParameters;

    if (!scriptURL.value) {
      initializationError.value = t("shared.payment.authorize_net.errors.incorrect_payment_method");
      return;
    }

    // Load Accept.js before exposing the form and registering the payment processor.
    // Otherwise the cart checkout could finalize (tokenize) before the SDK is ready,
    // leaving the payment promise hanging and checkout stuck after the order is created.
    await loadAcceptJS();

    // The component may have been unmounted while Accept.js was loading — don't register
    // a torn-down instance as the active cart payment processor.
    if (!isActive) {
      return;
    }

    initialized.value = true;
    registerPaymentProcessor(sendPaymentData);
  } catch (e) {
    Logger.error(initPayment.name, e);
    initializationError.value = t("shared.payment.authorize_net.errors.incorrect_payment_method");
  }
}

function showErrors(messages: Accept.Message[]) {
  messages.forEach(({ code, text }) => {
    switch (code) {
      case "E_WC_05":
        bankCardErrors.value.number = t("shared.payment.bank_card_form.errors.card_number");
        break;

      case "E_WC_06":
        bankCardErrors.value.month = t("shared.payment.bank_card_form.errors.month");
        break;

      case "E_WC_07":
        bankCardErrors.value.year = t("shared.payment.bank_card_form.errors.year");
        break;

      case "E_WC_08":
        bankCardErrors.value.year = t("shared.payment.bank_card_form.errors.expiration_date");
        break;

      case "E_WC_15":
        bankCardErrors.value.securityCode = t("shared.payment.bank_card_form.errors.security_code");
        break;

      case "E_WC_17":
        bankCardErrors.value.cardholderName = t("shared.payment.bank_card_form.errors.cardholder_name");
        break;

      default:
        emit("fail", text);
    }

    // https://developer.authorize.net/api/reference/features/acceptjs.html#Appendix_Error_Codes
    Logger.error(`[Authorize.net][${code}]: ${text}`);
  });
}

async function pay(
  opaqueData: Accept.OpaqueData,
  orderToPay: CustomerOrderType | null = null,
): Promise<AuthorizePaymentResultType | null> {
  const order = orderToPay ?? props.order;
  if (!order) {
    return null;
  }

  const {
    id: orderId,
    inPayments: [{ id: paymentId }],
  } = order;

  const result = await sendOpaqueData({ orderId, paymentId, opaqueData });

  if (result.isSuccess) {
    emit("success");

    /**
     * Send Google Analytics purchase event.
     * Skip for cart finalization — the order is created and tracked by the checkout flow.
     */
    if (!orderToPay) {
      analytics("purchase", order);
    }
  } else {
    emit("fail", result.errorMessage);
  }

  return result;
}

function tokenize(): Promise<Accept.OpaqueData | null> {
  const { month, year, number: cardNumber, securityCode: cardCode, cardholderName: fullName } = bankCardData.value;
  const cardData: Accept.CardData = { cardNumber, month, year, cardCode, fullName };
  const authData: Accept.AuthData = { apiLoginID: apiLoginID.value, clientKey: clientKey.value };

  return new Promise((resolve, reject) => {
    try {
      dispatchData({ authData, cardData }, (response: Accept.Response) => {
        if (response.messages.resultCode === "Error") {
          // Field-level validation errors are surfaced inline (no hard "fail") so the
          // shopper can correct the card and retry without leaving the payment page.
          showErrors(response.messages.message);
          resolve(null);
        } else if (response.opaqueData) {
          resolve(response.opaqueData);
        } else {
          reject(new Error("Authorize.Net returned no opaque data"));
        }
      });
    } catch (e) {
      // dispatchData re-throws synchronous Accept.js failures (handler never fires).
      reject(e instanceof Error ? e : new Error("Authorize.Net dispatchData failed"));
    }
  });
}

async function sendPaymentData(
  orderToPay: CustomerOrderType | null = null,
): Promise<AuthorizePaymentResultType | null> {
  const order = orderToPay ?? props.order;
  if (!isValidBankCard.value || !order) {
    return null;
  }

  loading.value = true;

  try {
    const opaqueData = await tokenize();

    // No opaque data means a field-level validation error was shown inline — let the
    // shopper fix the card and retry instead of emitting a hard failure.
    if (!opaqueData) {
      return null;
    }

    return await pay(opaqueData, orderToPay);
  } catch (e) {
    Logger.error(sendPaymentData.name, e);
    emit("fail");
    return null;
  } finally {
    loading.value = false;
  }
}

defineExpose({
  loading,
  initialized,
  isValidBankCard,
});

onMounted(async () => {
  await initPayment();
});

onUnmounted(() => {
  // Only stop late async init from registering a torn-down instance.
  // Do NOT clear the shared payment processor or card-validity state here: in multistep
  // checkout this form lives on the Billing step and unmounts before Place Order on Review,
  // and the shared state must survive so `isCanFinalizePayment` stays true and
  // `finalizePayment` can charge the placed order (same approach as CyberSource).
  isActive = false;
});

watch(
  isValidBankCard,
  (isValid) => {
    if (isValid) {
      setCardDataValid();
    } else {
      setCardDataInvalid();
    }
  },
  { immediate: true },
);

watch(bankCardData, () => (bankCardErrors.value = {}));
</script>
