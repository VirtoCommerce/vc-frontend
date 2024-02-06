<template>
  <template v-if="initialized">
    <div class="flex flex-col xl:flex-row">
      <BankCardForm
        v-model="bankCardData"
        v-model:valid="isValidBankCard"
        :errors="bankCardErrors"
        :disabled="loading"
        class="xl:w-2/3"
        @submit="sendPaymentData"
      />
    </div>
    <div class="mt-6">
      <VcButton
        :disabled="!isValidBankCard || disabled"
        :loading="loading"
        class="flex-1 md:order-first md:flex-none"
        @click="sendPaymentData"
      >
        {{ $t("shared.payment.skyflow.pay_now_button") }}
      </VcButton>
    </div>
  </template>
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">
import { clone } from "lodash";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useGoogleAnalytics } from "@/core/composables";
import { Logger } from "@/core/utilities";
import BankCardForm from "../components/bank-card-form.vue";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { BankCardErrorsType, BankCardType } from "@/shared/payment";

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const emptyBankCardData: BankCardType = {
  cardholderName: "",
  number: "",
  month: "",
  year: "",
  securityCode: "",
};

const bankCardData = ref<BankCardType>(clone(emptyBankCardData));
const isValidBankCard = ref(false);
const bankCardErrors = ref<BankCardErrorsType>({});

const loading = ref(false);
const ga = useGoogleAnalytics();
const { t } = useI18n();

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

interface IProps {
  order: CustomerOrderType;
  disabled?: boolean;
}

//todo add correct codes
function showErrors(messages: { code: string; text: string }[]) {
  messages.forEach(({ code, text }) => {
    switch (code) {
      case "number":
        bankCardErrors.value.number = t("shared.payment.skyflow.errors.number");
        break;

      case "month":
        bankCardErrors.value.month = t("shared.payment.skyflow.errors.month");
        break;

      case "year":
        bankCardErrors.value.year = t("shared.payment.skyflow.errors.year");
        break;

      case "exp_year":
        bankCardErrors.value.year = t("shared.payment.skyflow.errors.expiration_date");
        break;

      case "security_code":
        bankCardErrors.value.securityCode = t("shared.payment.skyflow.errors.security_code");
        break;

      case "cardholder_name":
        bankCardErrors.value.cardholderName = t("shared.payment.skyflow.errors.cardholder_name");
        break;

      default:
        emit("fail", text);
    }

    Logger.error(`[Skyflow][${code}]: ${text}`);
  });
}

function sendPaymentData() {
  loading.value = true;
  if (!isValidBankCard.value) {
    return;
  }

  ga.purchase(props.order);

  showErrors([{ code: "cardholder_name", text: "error" }]);

  loading.value = false;

  console.log(bankCardData.value);
}

const initialized = ref(false);

async function initPayment() {
  // todo add skyflow here
  initialized.value = await Promise.resolve(true);
}

onMounted(async () => {
  await initPayment();
});
</script>
