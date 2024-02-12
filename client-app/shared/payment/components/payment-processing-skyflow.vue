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
import { useNotifications } from "@/shared/notification";
import BankCardForm from "../components/bank-card-form.vue";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import type { BankCardErrorsType, BankCardType } from "@/shared/payment";

const props = defineProps<IProps>();

type FieldsType = { [key: string]: string };
type SkyflowResponseType = {
  records: [
    {
      fields: FieldsType;
      table: string;
    },
  ];
};

const { t } = useI18n();
const notifications = useNotifications();

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
      showErrorNotification();
      console.error(errorMessage);
      return;
    }

    if (!publicParameters) {
      showErrorNotification();
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
    showErrorNotification();
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
          card_expiration: `20${bankCardData.value.year}-${bankCardData.value.month}`,
          cvv: bankCardData.value.securityCode,
        },
      },
    ],
  })) as SkyflowResponseType;

  if (!res?.records) {
    showErrorNotification();
    console.error("Skyflow data saving error");
  }

  const newRes = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
    parameters: objectToKeyValue(res.records.find((el) => el.fields)?.fields as FieldsType),
  });

  console.log(newRes);

  ga.purchase(props.order);

  loading.value = false;
}

function showErrorNotification() {
  notifications.error({
    duration: 5000,
    single: true,
    text: t("shared.payment.skyflow.errors.payment_failed"),
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
