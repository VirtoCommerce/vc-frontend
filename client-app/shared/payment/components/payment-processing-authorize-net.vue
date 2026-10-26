<template>
  <!-- Initialization Error -->
  <p v-if="initializationError" class="text-center font-bold text-danger md:text-left">
    {{ initializationError }}
  </p>

  <!-- Bank card form -->
  <div v-else-if="initialized">
    <SavedCardPicker
      v-model="selectedCard"
      :methods="savedCards"
      :new-card-value="NEW_CARD"
      :disabled="loading"
      name="authorize-net-card"
    />

    <template v-if="selectedCard === NEW_CARD">
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

      <template v-if="canSaveCard">
        <VcCheckbox
          v-model="saveCard"
          :disabled="!!cardSavingRequirement || loading"
          class="mt-4"
          test-id="authorize-net-save-card"
        >
          {{ $t("shared.payment.saved_cards.save_card") }}
        </VcCheckbox>

        <p v-if="cardSavingRequirement" class="mt-1 text-xs text-neutral-600">
          {{ $t("shared.payment.saved_cards.save_card_required") }}
        </p>
      </template>
    </template>

    <div class="mt-6 flex flex-col items-center gap-x-6 gap-y-4 md:flex-row xl:mt-8">
      <PaymentPolicies />

      <VcButton
        v-if="!hidePaymentButton"
        :disabled="!canPay || disabled"
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
import { computed, onMounted, onUnmounted, ref, shallowRef, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authorizePayment, initializeCartPayment, initializePayment } from "@/core/api/graphql";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import { useAuthorizeNet } from "@/shared/payment/composables/useAuthorizeNet";
import { PaymentActionType } from "@/shared/payment/types";
import { usePayment } from "../composables";
import { useCardSavingRequirement } from "../composables/useCardSavingRequirement";
import { useSavedPaymentMethods } from "../composables/useSavedPaymentMethods";
import PaymentPolicies from "./payment-policies.vue";
import SavedCardPicker from "./saved-card-picker.vue";
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

/** Saved cards can only pay through the payment method that saved them. */
const PAYMENT_METHOD_CODE = "AuthorizeNetPaymentMethod";
const NEW_CARD = "new";

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
const selectedCard = ref(NEW_CARD);
const saveCard = ref(false);

// Guards against late async init completing after the component was torn down
// (e.g. the shopper switched payment method while Accept.js was still loading).
let isActive = true;

const scriptURL = computed<string>(() => parameters.value.find(({ key }) => key === "acceptJsPath")?.value ?? "");
const apiLoginID = computed<string>(() => parameters.value.find(({ key }) => key === "apiLogin")?.value ?? "");
const clientKey = computed<string>(() => parameters.value.find(({ key }) => key === "clientKey")?.value ?? "");

const { analytics } = useAnalytics();
const { t } = useI18n();
const { isAuthenticated } = useUser();
const { loadAcceptJS, dispatchData, sendOpaqueData } = useAuthorizeNet({ scriptURL, manualScriptLoading: true });
const { registerPaymentProcessor, setCardDataValid, setCardDataInvalid } = usePayment();
const { fetch: fetchSavedCards, methodsFor } = useSavedPaymentMethods();
const cardSaving = useCardSavingRequirement();

// Read once, for what this form pays: the requirement covers only the cart it was given for, or the order placed from it.
const { cart: paidCart, order: paidOrder } = toRefs(props);
const cardSavingRequirement = cardSaving.read({ cart: paidCart.value, order: paidOrder.value });

/** Only a signed-in customer has an account to keep cards in. */
const canSaveCard = computed(() => isAuthenticated.value);
const savedCards = computed(() => (isAuthenticated.value ? methodsFor(PAYMENT_METHOD_CODE) : []));
const isSavedCardSelected = computed(() => selectedCard.value !== NEW_CARD);
const canPay = computed(() => isSavedCardSelected.value || isValidBankCard.value);

/** Sent with the payment nonce: the payment method saves the card when the payment is approved. */
const cardSavingParameters = computed<KeyValueType[]>(() => {
  if (!canSaveCard.value) {
    return [];
  }

  // said out loud, so an earlier "save it" for this order isn't sent again on a retry
  if (!(saveCard.value || cardSavingRequirement)) {
    return [{ key: "storeForFutureUse", value: "false" }];
  }

  return [
    { key: "storeForFutureUse", value: "true" },
    { key: "consentId", value: cardSavingRequirement?.consentId ?? "" },
  ];
});

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

async function initSavedCards() {
  if (!isAuthenticated.value) {
    return;
  }

  await fetchSavedCards();

  // A link to pay an order can name the card to use (e.g. a renewal the bank declined); otherwise the default card.
  const requested = new URLSearchParams(window.location.search).get("card");
  const cards = savedCards.value;
  const preferred = cards.find((x) => x.id === requested) ?? cards.find((x) => x.isDefault) ?? cards[0];
  if (preferred) {
    selectedCard.value = preferred.id;
  }
}

async function initPayment() {
  try {
    const [{ isSuccess, paymentActionType, publicParameters = [], errorMessage = "" }] = await Promise.all([
      initializeByCartOrOrder(),
      initSavedCards(),
    ]);

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

function onPaid(order: CustomerOrderType, result: AuthorizePaymentResultType, isCartFinalization: boolean) {
  if (result.isSuccess) {
    cardSaving.clear();
    emit("success");

    /**
     * Send Google Analytics purchase event.
     * Skip for cart finalization — the order is created and tracked by the checkout flow.
     */
    if (!isCartFinalization) {
      analytics("purchase", order);
    }
  } else {
    emit("fail", result.errorMessage);
  }
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

  const result = await sendOpaqueData({
    orderId,
    paymentId,
    opaqueData,
    additionalParameters: cardSavingParameters.value,
  });
  onPaid(order, result, !!orderToPay);

  return result;
}

/** Pays with the chosen saved card; the server checks that it is the customer's and still active. */
async function payWithSavedCard(
  order: CustomerOrderType,
  isCartFinalization: boolean,
): Promise<AuthorizePaymentResultType> {
  const result = await authorizePayment({
    orderId: order.id,
    paymentId: order.inPayments[0].id,
    parameters: [{ key: "storedPaymentMethodId", value: selectedCard.value }],
  });
  onPaid(order, result, isCartFinalization);

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
  if (!canPay.value || !order) {
    return null;
  }

  loading.value = true;

  try {
    if (isSavedCardSelected.value) {
      return await payWithSavedCard(order, !!orderToPay);
    }

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
  canPay,
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
