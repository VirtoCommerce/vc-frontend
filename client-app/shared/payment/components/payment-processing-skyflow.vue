<template>
  <div>
    <template v-if="skyflowCards?.length">
      <VcSelect
        :model-value="selectedSkyflowCard"
        :label="$t('common.labels.saved_cards')"
        :items="creditCards"
        size="auto"
        item-size="lg"
        class="mb-4 lg:w-2/5"
        @change="(value) => selectSkyflowCard(value)"
      >
        <template #placeholder>
          <div class="flex items-center gap-3 p-3 text-sm">
            <VcIcon class="fill-neutral" name="credit-card" size="xl" />

            {{ $t("common.placeholders.select_credit_card") }}
          </div>
        </template>

        <template #selected="{ item }">
          <div class="flex items-center gap-3 p-3 text-sm">
            <VcIcon v-if="item.skyflowId.length" class="fill-neutral" name="credit-card" size="xl" />

            <VcIcon v-else class="size-12 fill-success" name="plus-circle-outlined" />

            {{ item.cardNumber }}

            <template v-if="item.cardExpiration">({{ item.cardExpiration }})</template>
          </div>
        </template>

        <template #item="{ item }">
          <VcIcon v-if="item.skyflowId.length" class="fill-neutral" name="credit-card" size="xl" />

          <VcIcon v-else class="size-12 fill-success" name="plus-circle-outlined" />

          {{ item.cardNumber }}

          <template v-if="item.cardExpiration">({{ item.cardExpiration }})</template>
        </template>
      </VcSelect>
    </template>

    <VcLoaderWithText v-if="skyflowFormLoading" />

    <div ref="skyflowContainer" class="-mx-1 w-full max-w-2xl bg-additional-50"></div>

    <div v-if="addNewCardSelected || !skyflowCards?.length">
      <div class="mt-6 flex">
        <VcCheckbox v-model="saveCreditCard">
          {{ $t("common.labels.save_card_for_future_payments") }}
        </VcCheckbox>
      </div>

      <div class="mt-6 flex flex-col items-center gap-x-6 gap-y-4 md:flex-row xl:mt-8">
        <PaymentPolicies />

        <VcButton
          data-test-id="pay-now-button"
          :disabled="hasInvalid"
          :loading="loading"
          class="flex-1 md:order-first md:flex-none"
          @click="payWithNewCreditCard"
        >
          {{ $t("shared.payment.bank_card_form.pay_now_button") }}
        </VcButton>
      </div>
    </div>

    <div v-else-if="selectedSkyflowCard && skyflowCards?.length">
      <div class="mt-6 flex justify-center md:justify-start">
        <VcButton
          :disabled="isSavedCardPayBtnDisabled"
          :loading="loading"
          class="shrink"
          @click="payWithSavedCreditCard"
        >
          {{ $t("shared.payment.bank_card_form.pay_now_button") }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skyflow from "skyflow-js";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import { useAnalytics, useThemeContext } from "@/core/composables";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger, replaceXFromBeginning } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { useNotifications } from "@/shared/notification";
import { useSkyflowCards, useSkyflowStyles } from "../composables";
import PaymentPolicies from "./payment-policies.vue";
import type { CustomerOrderType, InputKeyValueType, KeyValueType } from "@/core/api/graphql/types";
import type ComposableContainer from "skyflow-js/types/core/external/collect/compose-collect-container";
import type ComposableElement from "skyflow-js/types/core/external/collect/compose-collect-element";
import type { IInsertRecordInput, IInsertResponse } from "skyflow-js/types/utils/common";

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const CVV_REGEX = "^[0-9]{3,4}$";

interface IProps {
  order: CustomerOrderType;
}

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

type FieldsType = { [key: string]: string };

const { t } = useI18n();
const { user, isAuthenticated } = useUser();
const { skyflowCards, fetchSkyflowCards } = useSkyflowCards();
const { analytics } = useAnalytics();
const { themeContext } = useThemeContext();
const {
  containerStyles,
  containerErrorTextStyles,
  newCardCollectStyles,
  newCardCvvCollectStyles,
  cvvOnlyCollectStyles,
} = useSkyflowStyles();
const notifications = useNotifications();

const loading = ref(false);
const skyflowContainer = ref<HTMLElement | string>("");
const saveCreditCard = ref(false);
const selectedSkyflowCard = ref<{ cardNumber: string; cardExpiration?: string; skyflowId: string }>();

const creditCards = computed(() => {
  const cards =
    skyflowCards.value
      ?.map((el) => {
        return {
          ...el,
          cardNumber: replaceXFromBeginning(el.cardNumber),
        };
      })
      .filter((el) => el.active) || [];

  return cards.concat([
    {
      cardNumber: t("common.labels.add_new_card"),
      skyflowId: "",
      active: false,
    },
  ]);
});
const addNewCardSelected = computed(() => selectedSkyflowCard.value?.cardNumber === t("common.labels.add_new_card"));

const skyflowFormLoading = computed(() => {
  if (!skyflowCards.value?.length) {
    return !newCardFormInitialized.value;
  }
  if (addNewCardSelected.value) {
    return !newCardFormInitialized.value;
  }
  if (selectedSkyflowCard.value && isSavedCardCvvRequired.value) {
    return !cvvCollectorStatus.value.ready;
  }
  return false;
});

function selectSkyflowCard(skyflowCard: { cardNumber: string; cardExpiration?: string; skyflowId: string }): void {
  selectedSkyflowCard.value = skyflowCard;
  if (isNewCard(skyflowCard)) {
    void initNewCardForm();
  } else {
    void initCvvForm();
  }
}

let skyflowClient: Skyflow,
  skyflowTableName: string,
  fullCardCollector: ComposableContainer,
  cvvCollector: ComposableContainer | null,
  cvvElement: ComposableElement | null;

// NEW CARD START
type ElementType =
  | typeof Skyflow.ElementType.CARD_NUMBER
  | typeof Skyflow.ElementType.CARDHOLDER_NAME
  | typeof Skyflow.ElementType.EXPIRATION_DATE
  | typeof Skyflow.ElementType.INPUT_FIELD;

const newCardFormElementsStatus = ref<{
  [key in ElementType]: {
    valid: boolean;
    ready: boolean;
  };
}>({
  [Skyflow.ElementType.CARD_NUMBER]: { valid: false, ready: false },
  [Skyflow.ElementType.CARDHOLDER_NAME]: { valid: false, ready: false },
  [Skyflow.ElementType.EXPIRATION_DATE]: { valid: false, ready: false },
  [Skyflow.ElementType.INPUT_FIELD]: { valid: false, ready: false },
});

function updateValidationStatus({ elementType, isValid }: { elementType: ElementType; isValid: boolean }) {
  newCardFormElementsStatus.value[elementType].valid = isValid;
}
function setReadyState({ elementType }: { elementType: ElementType }) {
  newCardFormElementsStatus.value[elementType].ready = true;
}

const hasInvalid = computed(() => {
  return Object.values(newCardFormElementsStatus.value).some((el) => !el.valid);
});

const newCardFormInitialized = computed(() => {
  return Object.values(newCardFormElementsStatus.value).every((el) => el.ready);
});

async function initNewCardForm(): Promise<void> {
  clearCvv();

  if (newCardFormInitialized.value) {
    fullCardCollector.mount(skyflowContainer.value);
    return;
  }

  await initPayment();

  const containerOptions = {
    layout: [1, 1, 2],
    styles: { base: containerStyles },
    errorTextStyles: containerErrorTextStyles,
  };

  const container = skyflowClient.container(Skyflow.ContainerType.COMPOSABLE, containerOptions);

  container.on(Skyflow.EventName.SUBMIT, () => {
    if (!hasInvalid.value) {
      void payWithNewCreditCard();
    }
  });

  const cardName = container.create(
    {
      table: skyflowTableName,
      column: "card_number",
      ...newCardCollectStyles,
      placeholder: "1111 1111 1111 1111",
      label: t("shared.payment.bank_card_form.number_label"),
      type: Skyflow.ElementType.CARD_NUMBER,
    },
    {
      enableCardIcon: true,
      required: true,
    },
  );

  const cardholderName = container.create(
    {
      table: skyflowTableName,
      column: "cardholder_name",
      ...newCardCollectStyles,
      label: t("shared.payment.bank_card_form.cardholder_name_label"),
      type: Skyflow.ElementType.CARDHOLDER_NAME,
    },
    {
      required: true,
    },
  );

  const cardExpiration = container.create(
    {
      table: skyflowTableName,
      column: "card_expiration",
      ...newCardCollectStyles,
      placeholder: t("shared.payment.bank_card_form.expiration_date_placeholder"),
      label: t("shared.payment.bank_card_form.expiration_date_label"),
      type: Skyflow.ElementType.EXPIRATION_DATE,
    },
    {
      required: true,
    },
  );

  const CVV = container.create(
    {
      table: skyflowTableName,
      column: "cvv",
      ...newCardCvvCollectStyles,
      placeholder: "111",
      label: t("shared.payment.bank_card_form.security_code_label"),
      type: Skyflow.ElementType.INPUT_FIELD,
      validations: [
        {
          type: Skyflow.ValidationRuleType.REGEX_MATCH_RULE,
          params: {
            regex: CVV_REGEX,
            error: t("shared.payment.bank_card_form.errors.security_code"),
          },
        },
      ],
    },
    {
      required: true,
      masking: true,
      format: "XXXX",
    },
  );

  [cardName, cardholderName, cardExpiration, CVV].forEach((el) => {
    el.on(Skyflow.EventName.CHANGE, updateValidationStatus);
    el.on(Skyflow.EventName.READY, setReadyState);
  });

  container.mount(skyflowContainer.value);

  fullCardCollector = container;
}

function isNewCard(card: { skyflowId: string }) {
  return !card.skyflowId;
}
// NEW CARD END

// CVV only START
const isSavedCardCvvRequired = computed(() => {
  return themeContext.value.settings.isCVVinSkyflowRequired;
});

const isSavedCardPayBtnDisabled = computed(() => {
  return !selectedSkyflowCard.value || (isSavedCardCvvRequired.value && !cvvCollectorStatus.value.valid);
});

const cvvCollectorStatus = ref({ valid: false, ready: false });

async function initCvvForm() {
  if (!isSavedCardCvvRequired.value) {
    return;
  }

  await initPayment();

  fullCardCollector?.unmount();
  clearCvv();

  const containerOptions = {
    layout: [1],
    styles: { base: containerStyles },
    errorTextStyles: containerErrorTextStyles,
  };

  const container = skyflowClient.container(Skyflow.ContainerType.COMPOSABLE, containerOptions);

  const CVV = container.create(
    {
      table: skyflowTableName,
      column: "cvv",
      ...cvvOnlyCollectStyles,
      placeholder: "111",
      label: t("shared.payment.bank_card_form.security_code_label"),
      type: Skyflow.ElementType.INPUT_FIELD,
      validations: [
        {
          type: Skyflow.ValidationRuleType.REGEX_MATCH_RULE,
          params: {
            regex: CVV_REGEX,
            error: t("shared.payment.bank_card_form.errors.security_code"),
          },
        },
      ],
    },
    {
      required: true,
      masking: true,
      format: "XXXX",
    },
  );

  CVV.on(Skyflow.EventName.CHANGE, ({ isValid }: { isValid: boolean }) => {
    cvvCollectorStatus.value.valid = isValid;
  });
  container.mount(skyflowContainer.value);

  cvvCollectorStatus.value.ready = true;

  cvvCollector = container;
  cvvElement = CVV;
}

function clearCvv() {
  cvvCollector?.unmount();
  cvvCollector = null;
  cvvElement = null;
  cvvCollectorStatus.value.valid = false;
  cvvCollectorStatus.value.ready = false;
}

async function updateCvvInVault(): Promise<void> {
  if (!cvvCollector || !cvvElement) {
    return;
  }

  cvvElement.update({
    skyflowID: selectedSkyflowCard.value?.skyflowId,
  });

  await cvvCollector.collect();
}
// CVV only END

// PAYMENT START
async function initPayment() {
  if (skyflowClient) {
    return;
  }

  try {
    const { publicParameters, errorMessage } = await initializePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0].id,
    });

    if (errorMessage || !publicParameters) {
      showError(t("shared.payment.bank_card_form.payment_unavailable"));
      return;
    }

    skyflowTableName = getParameter(publicParameters, "tableName");

    skyflowClient = Skyflow.init({
      vaultID: getParameter(publicParameters, "vaultID"),
      vaultURL: getParameter(publicParameters, "vaultURL"),
      getBearerToken: () => Promise.resolve(getParameter(publicParameters, "accessToken")),
      options: {
        env: IS_DEVELOPMENT ? Skyflow.Env.DEV : Skyflow.Env.PROD,
      },
    });
  } catch {
    showError(t("shared.payment.bank_card_form.payment_unavailable"));
  }
}

function getAdditionalRecords(): IInsertRecordInput | undefined {
  if (!isAuthenticated.value || !saveCreditCard.value) {
    return;
  }

  return {
    records: [
      {
        table: skyflowTableName,
        fields: {
          user_id: user.value.id,
        },
      },
    ],
  };
}

async function pay(parameters: InputKeyValueType[]): Promise<void> {
  const { isSuccess } = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0].id,
    parameters,
  });

  if (isSuccess) {
    analytics("purchase", props.order);
    emit("success");
  } else {
    emit("fail");
  }
}

async function payWithNewCreditCard() {
  loading.value = true;

  const res = (await fullCardCollector.collect({
    additionalFields: getAdditionalRecords(),
  })) as IInsertResponse;

  if (!res?.records) {
    emit("fail");
  }

  await pay(objectToKeyValue(res.records.find((el) => el.fields)?.fields as FieldsType));

  loading.value = false;
}

async function payWithSavedCreditCard() {
  loading.value = true;

  if (!selectedSkyflowCard.value) {
    return;
  }

  if (isSavedCardCvvRequired.value) {
    await updateCvvInVault();
  }

  await pay([
    {
      key: "skyflow_id",
      value: selectedSkyflowCard.value.skyflowId,
    },
  ]);

  loading.value = false;
}
// PAYMENT END

function showError(message: string) {
  notifications.error({
    text: message,
    duration: 10000,
    single: true,
  });
}

onMounted(async () => {
  try {
    await fetchSkyflowCards();
  } catch (e) {
    Logger.error(onMounted.name, e);
  }

  if (!skyflowCards.value?.length) {
    void initNewCardForm();
  }
});

// utils
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
