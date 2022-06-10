<template>
  <div>
    <h5 class="mb-3 font-extrabold" v-t="'shared.payment.authorize_net.header'" />

    <div class="rounded border overflow-hidden">
      <div class="px-6 py-5 shadow-lg">
        <svg width="43" height="37" class="inline-block text-gray-400 opacity-80 mr-5">
          <use href="/static/images/payment/bank-card.svg#main" />
        </svg>

        <span>{{ $t("shared.payment.authorize_net.bank_card_title") }}</span>
      </div>

      <div class="p-7 pt-6">
        <div class="flex flex-col xl:flex-row">
          <BankCardForm
            v-model="bankCardData"
            v-model:valid="isValidBankCard"
            :errors="bankCardErrors"
            :is-disabled="loading"
            class="xl:w-2/3"
          />

          <div class="flex flex-col order-first xl:order-none xl:w-1/3 mb-4 xl:mb-0 xl:pl-6 xl:pt-6">
            <div class="flex flex-row flex-wrap gap-3 xl:gap-5">
              <svg width="71" height="48" class="flex shrink-0 border border-gray-300 rounded">
                <use href="/static/images/payment/methods/visa.svg#main" />
              </svg>

              <svg width="71" height="48" class="flex shrink-0 border border-gray-300 rounded">
                <use href="/static/images/payment/methods/mastercard.svg#main" />
              </svg>

              <svg width="71" height="48" class="flex shrink-0 border border-gray-300 rounded">
                <use href="/static/images/payment/methods/maestro.svg#main" />
              </svg>
            </div>
          </div>
        </div>

        <!--
        <VcCheckbox class="mt-7">Save my details for future payments. It's safe.</VcCheckbox>
        -->
      </div>
    </div>

    <div class="flex flex-col md:flex-row items-center justify-between gap-5 mt-6">
      <p class="text-sm text-gray-500">
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
        :is-disabled="!isValidBankCard"
        :is-waiting="loading"
        @click="sendPaymentData"
        size="lg"
        class="shrink-0 uppercase w-48"
      >
        {{ $t("shared.payment.authorize_net.pay_now_button") }}
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref, watch, watchEffect } from "vue";
import { clone } from "lodash";
import { CustomerOrderType, KeyValueType } from "@core/api/graphql/types";
import { VcButton } from "@/components";
import { BankCardType, BankCardForm, useAuthorizeNet, BankCardErrorsType } from "@/shared/payment";
import { useNotifications } from "@/shared/notification";
import { useI18n } from "vue-i18n";
import { Logger } from "@core/utilities";

const emit = defineEmits<{
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}>();

const props = defineProps({
  order: {
    type: Object as PropType<CustomerOrderType>,
    required: true,
  },

  parameters: {
    type: Array as PropType<KeyValueType[]>,
    default: () => [],
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

const loading = ref(false);
const isValidBankCard = ref(false);
const bankCardData = ref<BankCardType>(clone(emptyBankCardData));
const bankCardErrors = ref<BankCardErrorsType>({});

const scriptURL = computed<string>(() => props.parameters.find(({ key }) => key === "acceptJsPath")?.value ?? "");
const apiLoginID = computed<string>(() => props.parameters.find(({ key }) => key === "apiLogin")?.value ?? "");
const clientKey = computed<string>(() => props.parameters.find(({ key }) => key === "clientKey")?.value ?? "");

const { t } = useI18n();
const notifications = useNotifications();
const { loadAcceptJS, dispatchData, sendOpaqueData } = useAuthorizeNet({ scriptURL, manualScriptLoading: true });

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
      await showErrors(response.messages.message);
    } else if (response.opaqueData) {
      await authorizePayment(response.opaqueData);
    }

    loading.value = false;
  });
}

watch(bankCardData, () => (bankCardErrors.value = {}));

watchEffect(() => {
  if (scriptURL.value) {
    loadAcceptJS();
  }
});
</script>
