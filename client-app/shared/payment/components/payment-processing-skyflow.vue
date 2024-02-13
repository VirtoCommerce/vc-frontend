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

  ga.purchase(props.order);

  if (newRes.isSuccess) {
    emit("success");
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
  const containerOptions = {
    layout: [1, 1, 2],
    styles: {
      base: {
        fontFamily: "Lato, sans-serif",
        width: "100%",
        gap: "12px",
        margin: "4px 0",
      },
    },
    errorTextStyles: {
      base: {
        color: "#FF4A4A",
      },
    },
  };

  const container = skyflowClient.container(Skyflow.ContainerType.COMPOSABLE, containerOptions) as ComposableContainer;

  const collectStylesOptions = {
    inputStyles: {
      base: {
        fontFamily: "inherit",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "0.9375rem",
        lineHeight: "1",
        borderRadius: "3px",
        border: "1px solid #e5e7eb",
        padding: "0.75rem",
      },
      global: {
        "@import":
          'url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;0,900;1,400&family=Roboto+Condensed:wght@700&display=swap")',
      },
    },
    labelStyles: {
      base: {
        fontSize: "0.9375rem",
        fontWeight: 700,
        lineHeight: "1.25rem",
        marginBottom: "0.125rem",
      },
    },
    errorTextStyles: {
      base: {},
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
      },
    )
    .on(Skyflow.EventName.CHANGE, updateValidationStatus);

  container
    .create({
      table: skyflowTableName,
      column: "cardholder_name",
      ...collectStylesOptions,
      label: t("shared.payment.bank_card_form.cardholder_name_label"),
      type: Skyflow.ElementType.CARDHOLDER_NAME,
    })
    .on(Skyflow.EventName.CHANGE, updateValidationStatus);

  container
    .create({
      table: skyflowTableName,
      column: "card_expiration",
      ...collectStylesOptions,
      placeholder: "MM / DD",
      label: t("shared.payment.bank_card_form.expiration_date_label"),
      type: Skyflow.ElementType.EXPIRATION_DATE,
    })
    .on(Skyflow.EventName.CHANGE, updateValidationStatus);

  container
    .create({
      table: skyflowTableName,
      column: "cvv",
      ...collectStylesOptions,
      placeholder: "111",
      label: t("shared.payment.bank_card_form.security_code_label"),
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
    })
    .on(Skyflow.EventName.CHANGE, updateValidationStatus);

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
