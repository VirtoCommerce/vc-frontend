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
import Skyflow from "skyflow-js";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment } from "@/core/api/graphql";
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

const initialized = ref(false);

let skyflowClient: Skyflow, skyflowTableName: string;

async function initPayment() {
  const data = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
  });

  skyflowTableName = getParameter("tableName");

  skyflowClient = Skyflow.init({
    vaultID: getParameter("vaultId"),
    vaultURL: getParameter("vaultUrl"),
    getBearerToken: () => Promise.resolve(getParameter("accessToken")),
    options: {
      logLevel: Skyflow.LogLevel,
      env: Skyflow.Env,
    },
  });

  function getParameter(name: string): string {
    const param = data.publicParameters?.find((el) => el.key === name);
    if (!param?.value) {
      throw new Error(`Missed parameter ${name}`);
    }

    return param.value;
  }

  initialized.value = true;
}
async function sendPaymentData() {
  loading.value = true;

  if (!isValidBankCard.value || !skyflowClient || !skyflowTableName) {
    return;
  }

  const res: unknown = await skyflowClient.insert({
    records: [
      {
        table: skyflowTableName,
        fields: {
          cardholder_name: bankCardData.value.cardholderName,
          card_number: bankCardData.value.number,
          expiry_month: bankCardData.value.month,
          expiry_year: bankCardData.value.year,
          cvv: bankCardData.value.securityCode,
        },
      },
    ],
  });

  /* todo
      handle skyflow errors
      send records.skyflow_id to back
      handle errors
  */

  console.log(res);
  showErrors([]);
  ga.purchase(props.order);

  loading.value = false;
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

onMounted(async () => {
  await initPayment();
});
</script>
