<template>
  <template v-if="initialized">
    <div class="flex flex-col xl:flex-row">
      <div id="composableContainer"></div>
    </div>
    <div class="mt-6">
      <VcButton :disabled="disabled" :loading="loading" class="flex-1 md:order-first md:flex-none" @click="pay">
        {{ $t("shared.payment.skyflow.pay_now_button") }}
      </VcButton>
    </div>
  </template>
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">
import Skyflow from "skyflow-js";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { useNotifications } from "@/shared/notification";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import type ComposableContainer from "skyflow-js/types/core/external/collect/compose-collect-container";

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

const loading = ref(false);
const ga = useGoogleAnalytics();

interface IProps {
  order: CustomerOrderType;
  disabled?: boolean;
}

const initialized = ref(false);

let skyflowClient: Skyflow, skyflowTableName: string, composableContainer: ComposableContainer;

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
        logLevel: Skyflow.LogLevel.ERROR,
        env: Skyflow.Env.DEV,
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

  const res = (await composableContainer.collect({
    tokens: true,
  })) as SkyflowResponseType;

  console.log("skyflow response", res);

  if (!res?.records) {
    showErrorNotification();
    console.error("Skyflow data saving error");
  }

  const newRes = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
    parameters: objectToKeyValue(res.records.find((el) => el.fields)?.fields as FieldsType),
  });

  console.log("XAPI authorizePayment response", newRes);

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
  createForm();
});

function createForm() {
  const containerOptions = {
    layout: [1, 1, 2],
    styles: {
      base: {
        border: "1px solid #eae8ee",
        padding: "10px 16px",
        borderRadius: "4px",
        margin: "12px 4px",
      },
    },
    errorTextStyles: {
      base: {
        color: "red",
      },
    },
  };

  const container = skyflowClient.container(Skyflow.ContainerType.COMPOSABLE, containerOptions) as ComposableContainer;

  const collectStylesOptions = {
    inputStyles: {
      base: {
        fontFamily: "Inter",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: "21px",
        width: "200px",
      },
    },
    labelStyles: {},
    errorTextStyles: {
      base: {},
    },
  };

  container.create(
    {
      table: skyflowTableName,
      column: "card_number",
      ...collectStylesOptions,
      placeholder: "Card Number",
      type: Skyflow.ElementType.CARD_NUMBER,
    },
    {
      enableCardIcon: false,
    },
  );

  container.create({
    table: skyflowTableName,
    column: "cardholder_name",
    ...collectStylesOptions,
    placeholder: "Cardholder Name",
    type: Skyflow.ElementType.CARDHOLDER_NAME,
  });

  container.create({
    table: skyflowTableName,
    column: "card_expiration",
    ...collectStylesOptions,
    placeholder: "expiration date",
    type: Skyflow.ElementType.EXPIRATION_DATE,
  });

  container.create({
    table: skyflowTableName,
    column: "cvv",
    ...collectStylesOptions,
    placeholder: "CVV",
    type: Skyflow.ElementType.CVV,
    validations: [
      {
        type: Skyflow.ValidationRuleType.LENGTH_MATCH_RULE,
        params: {
          min: 3,
          error: "cvv must be min 3 digits",
        },
      },
    ],
  });

  // Step 3
  container.mount("#composableContainer");

  composableContainer = container;
}

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
