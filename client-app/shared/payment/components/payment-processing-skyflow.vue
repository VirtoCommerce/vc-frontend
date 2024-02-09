<template>
  <template v-if="initialized">
    <div class="flex flex-col xl:flex-row">
      <BankCardForm
        v-model="bankCardData"
        v-model:valid="isValidBankCard"
        :errors="bankCardErrors"
        :disabled="loading"
        class="xl:w-2/3"
        @submit="pay"
      />
    </div>
    <div class="mt-6">
      <VcButton
        :disabled="!isValidBankCard || disabled"
        :loading="loading"
        class="flex-1 md:order-first md:flex-none"
        @click="pay"
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
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { Logger } from "@/core/utilities";
import BankCardForm from "../components/bank-card-form.vue";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import type { BankCardErrorsType, BankCardType } from "@/shared/payment";

type FieldsType = { [key: string]: string };
type SkyflowResponseType = {
  records: [
    {
      fields: FieldsType;
      table: string;
    },
  ];
};

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
  try {
    const { publicParameters, errorMessage } = await initializePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0]!.id,
    });

    if (errorMessage) {
      console.error(errorMessage);
      return;
    }

    if (!publicParameters) {
      console.error("Skyflow module parameters are not provided");
      return;
    }

    skyflowTableName = getParameter(publicParameters, "tableName");

    skyflowClient = Skyflow.init({
      vaultID: getParameter(publicParameters, "vaultID"),
      vaultURL: getParameter(publicParameters, "vaultURL"),
      getBearerToken: () => Promise.resolve(getParameter(publicParameters, "accessToken")),
      options: {
        logLevel: Skyflow.LogLevel,
        env: Skyflow.Env,
      },
    });

    initialized.value = true;
  } catch (e) {
    console.error(e);
  }
}
async function pay() {
  loading.value = true;

  if (!isValidBankCard.value || !skyflowClient || !skyflowTableName) {
    return;
  }

  const res = (await skyflowClient.insert({
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
  })) as SkyflowResponseType;

  if (!res?.records) {
    throw new Error("Skyflow error");
  }

  const newRes = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
    parameters: objectToKeyValue(res.records.find((el) => el.fields)?.fields as FieldsType),
  });

  console.log(newRes);

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

function getParameter(data: KeyValueType[], key: string): string {
  const param = data.find((el) => el.key === key);
  if (!param?.value) {
    throw new Error(`Missed parameter ${key}`);
  }

  return param.value;
}

function objectToKeyValue(object: { [key: string]: string }): KeyValueType[] {
  return Object.keys(object).map((key) => ({
    key,
    value: object[key],
  }));
}
</script>
