<template>
  <template v-if="initialized">
    <div class="flex flex-col xl:flex-row">
      <div id="composableContainer" class="flex grow"></div>
      <CardLabels class="mt-6" />
    </div>
    <div class="mt-6">
      <VcButton :disabled="isButtonDisabled" :loading="loading" class="flex-1 md:order-first md:flex-none" @click="pay">
        {{ $t("shared.payment.skyflow.pay_now_button") }}
      </VcButton>
    </div>
  </template>
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">
import Skyflow from "skyflow-js";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import type ComposableContainer from "skyflow-js/types/core/external/collect/compose-collect-container";
import type { IInsertResponse } from "skyflow-js/types/utils/common";
import CardLabels from "@/shared/payment/components/card-labels.vue";

interface IProps {
  order: CustomerOrderType;
}

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

type FieldsType = { [key: string]: string };

const { t } = useI18n();
const notifications = useNotifications();

const loading = ref(false);
const ga = useGoogleAnalytics();

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
      emit("fail");
      return;
    }

    if (!publicParameters) {
      emit("fail");
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
    emit("fail");
  }
}

async function pay() {
  loading.value = true;

  const res = (await composableContainer.collect({
    tokens: true,
  })) as IInsertResponse;

  if (!res?.records) {
    emit("fail");
  }

  const newRes = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
    parameters: objectToKeyValue(res.records.find((el) => el.fields)?.fields as FieldsType),
  });

  Logger.info("[authorizePayment]", newRes);

  if (newRes.isSuccess) {
    emit("success");
    ga.purchase(props.order);
  } else {
    showErrorNotification();
  }

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

type ElementType =
  | typeof Skyflow.ElementType.CARD_NUMBER
  | typeof Skyflow.ElementType.CARDHOLDER_NAME
  | typeof Skyflow.ElementType.EXPIRATION_DATE
  | typeof Skyflow.ElementType.CVV;

const validStatus = ref<{ [key in ElementType]: boolean }>({
  [Skyflow.ElementType.CARD_NUMBER]: false,
  [Skyflow.ElementType.CARDHOLDER_NAME]: false,
  [Skyflow.ElementType.EXPIRATION_DATE]: false,
  [Skyflow.ElementType.CVV]: false,
});

function updateValidationStatus(state: { elementType: ElementType; isValid: boolean }) {
  if (state.elementType in validStatus.value) {
    validStatus.value[state.elementType] = state.isValid;
  }
}

const isButtonDisabled = computed(() => {
  return Object.values(validStatus.value).some((el) => !el);
});

function createForm() {
  const global = {
    "@import":
      'url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;0,900;1,400&family=Roboto+Condensed:wght@700&display=swap")',
  };

  const dangerColor = "#FF4A4A";
  const borderColor = "#e5e7eb";
  const fontFamily = "Lato, sans-serif";

  const containerOptions = {
    layout: [1, 1, 2],
    styles: {
      base: {
        fontFamily,
        width: "100%",
        gap: "24px",
        margin: "4px 0",
      },
    },
    errorTextStyles: {
      base: {
        fontFamily,
        color: dangerColor,
      },
      global,
    },
  };

  const container = skyflowClient.container(Skyflow.ContainerType.COMPOSABLE, containerOptions) as ComposableContainer;

  const collectStylesOptions = {
    inputStyles: {
      base: {
        fontFamily,
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "0.9375rem",
        lineHeight: "1",
        borderRadius: "3px",
        border: `1px solid ${borderColor}`,
        padding: "0.75rem",
      },
      global,
    },
    labelStyles: {
      base: {
        fontFamily,
        fontSize: "0.9375rem",
        fontWeight: 700,
        lineHeight: "1.25rem",
        marginBottom: "0.125rem",
      },
      requiredAsterisk: {
        color: dangerColor,
      },
      global,
    },
  };

  container
    .create(
      {
        table: skyflowTableName,
        column: "card_number",
        ...collectStylesOptions,
        placeholder: "1111 1111 1111 1111",
        label: t("shared.payment.bank_card_form.number_label"),
        type: Skyflow.ElementType.CARD_NUMBER,
      },
      {
        enableCardIcon: false,
        required: true,
      },
    )
    .on(Skyflow.EventName.CHANGE, updateValidationStatus);

  container
    .create(
      {
        table: skyflowTableName,
        column: "cardholder_name",
        ...collectStylesOptions,
        label: t("shared.payment.bank_card_form.cardholder_name_label"),
        type: Skyflow.ElementType.CARDHOLDER_NAME,
      },
      {
        required: true,
      },
    )
    .on(Skyflow.EventName.CHANGE, updateValidationStatus);

  container
    .create(
      {
        table: skyflowTableName,
        column: "card_expiration",
        ...collectStylesOptions,
        placeholder: t("shared.payment.bank_card_form.expiration_date_placeholder"),
        label: t("shared.payment.bank_card_form.expiration_date_label"),
        type: Skyflow.ElementType.EXPIRATION_DATE,
      },
      {
        required: true,
      },
    )
    .on(Skyflow.EventName.CHANGE, updateValidationStatus);

  container
    .create(
      {
        table: skyflowTableName,
        column: "cvv",
        ...collectStylesOptions,
        placeholder: "111",
        label: t("shared.payment.bank_card_form.security_code_label"),
        type: Skyflow.ElementType.CVV,
      },
      {
        required: true,
      },
    )
    .on(Skyflow.EventName.CHANGE, updateValidationStatus);

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
