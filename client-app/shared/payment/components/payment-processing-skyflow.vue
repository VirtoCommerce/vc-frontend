<template>
  <div ref="root">
    <template v-if="skyflowCards?.length">
      <VcSelect
        :model-value="selectedSkyflowCard"
        :label="$t('common.labels.saved_cards')"
        :items="creditCards"
        size="auto"
        item-size="lg"
        class="lg:w-2/5"
        @change="(value) => selectSkyflowCard(value)"
      >
        <template #placeholder>
          <div class="flex items-center gap-3 p-3 text-sm">
            <VcIcon class="text-neutral" name="credit-card" size="xl" />

            {{ $t("common.placeholders.select_credit_card") }}
          </div>
        </template>

        <template #selected="{ item }">
          <div class="flex items-center gap-3 p-3 text-sm">
            <VcIcon v-if="item.skyflowId.length" class="text-neutral" name="credit-card" size="xl" />

            <VcIcon v-else class="size-12 text-success" name="plus-circle-outlined" />

            {{ item.cardNumber }}

            <template v-if="item.cardExpiration">({{ item.cardExpiration }})</template>
          </div>
        </template>

        <template #item="{ item }">
          <VcIcon v-if="item.skyflowId.length" class="text-neutral" name="credit-card" size="xl" />

          <VcIcon v-else class="size-12 text-success" name="plus-circle-outlined" />

          {{ item.cardNumber }}

          <template v-if="item.cardExpiration">({{ item.cardExpiration }})</template>
        </template>
      </VcSelect>

      <div v-show="!addNewCardSelected">
        <div ref="cvvOnlyContainer" class="-ml-1 mt-4"></div>
        <div class="mt-6 flex justify-center md:justify-start">
          <VcButton
            :disabled="isNewCardPayBtnDisabled"
            :loading="loading"
            class="shrink"
            @click="payWithSavedCreditCard"
          >
            {{ $t("shared.payment.skyflow.pay_now_button") }}
          </VcButton>
        </div>
      </div>
    </template>

    <div v-show="(newCardFormInitialized && !skyflowCards?.length) || addNewCardSelected">
      <div class="flex flex-col xl:flex-row">
        <div ref="cardContainer" class="grow"></div>
        <CardLabels class="mt-6" />
      </div>

      <div class="mt-6 flex items-center">
        <div class="shrink">
          <VcCheckbox v-model="saveCreditCard">
            {{ $t("common.labels.save_card_for_future_payments") }}
          </VcCheckbox>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-center gap-4 md:justify-start">
        <VcButton :disabled="hasInvalid" :loading="loading" class="shrink" @click="payWithNewCreditCard">
          {{ $t("shared.payment.skyflow.pay_now_button") }}
        </VcButton>
      </div>
    </div>

    <VcLoaderWithText v-if="!newCardFormInitialized && !skyflowCards?.length" />
  </div>
</template>

<script setup lang="ts">
import { useCssVar } from "@vueuse/core";
import { cloneDeep } from "lodash";
import Skyflow from "skyflow-js";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import { useGoogleAnalytics, useThemeContext } from "@/core/composables";
import { IS_DEVELOPMENT } from "@/core/constants";
import { replaceXFromBeginning } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { useSkyflowCards } from "../composables";
import type { CustomerOrderType, InputKeyValueType, KeyValueType } from "@/core/api/graphql/types";
import type CollectContainer from "skyflow-js/types/core/external/collect/collect-container";
import type CollectElement from "skyflow-js/types/core/external/collect/collect-element";
import type ComposableContainer from "skyflow-js/types/core/external/collect/compose-collect-container";
import type { IInsertRecordInput, IInsertResponse } from "skyflow-js/types/utils/common";
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
const { user, isAuthenticated } = useUser();
const { skyflowCards, fetchSkyflowCards } = useSkyflowCards();
const ga = useGoogleAnalytics();
const { themeContext } = useThemeContext();

const loading = ref(false);
const cardContainer = ref(null);
const root = ref(null);
const cvvOnlyContainer = ref(null);
const saveCreditCard = ref(false);
const selectedSkyflowCard = ref<{ cardNumber: string; cardExpiration?: string; skyflowId: string }>();

const creditCards = computed(() => {
  const cards =
    skyflowCards.value?.map((el) => {
      return {
        ...el,
        cardNumber: replaceXFromBeginning(el.cardNumber),
      };
    }) || [];
  return cards.concat([
    {
      cardNumber: t("common.labels.add_new_card"),
      skyflowId: "",
    },
  ]);
});
const addNewCardSelected = computed(() => selectedSkyflowCard.value?.cardNumber === t("common.labels.add_new_card"));

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
  cvvCollector: CollectContainer | null,
  cvvElement: CollectElement | null;

// styles for CVV only and for NEW CARD
const globalStyles = {
  global: {
    "@import": 'url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700&display=swap")',
  },
  fontFamily: "Lato, sans-serif",
  errorColor: useCssVar("--color-danger-500", root).value,
  borderColor: useCssVar("--color-neutral-200", root).value,
  focusOutlineColor: useCssVar("--color-primary-200", root).value,
};

const baseInputStyles = {
  fontFamily: globalStyles.fontFamily,
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "0.9375rem",
  lineHeight: "1",
  borderRadius: "3px",
  border: `1px solid ${globalStyles.borderColor}`,
  "&:focus": {
    border: "1px solid transparent",
    outline: `4px solid ${globalStyles.focusOutlineColor}`,
  },
};

const baseLabelStyles = {
  fontFamily: globalStyles.fontFamily,
  fontSize: "0.9375rem",
  fontWeight: 700,
  lineHeight: "1.25rem",
  marginBottom: "0.125rem",
};

const baseErrorStyles = {
  fontFamily: globalStyles.fontFamily,
  fontSize: "0.75rem",
  color: globalStyles.errorColor,
  textTransform: "lowercase",
  "&::first-letter": {
    textTransform: "uppercase",
  },
};
// end styles

// NEW CARD START
type ElementType =
  | typeof Skyflow.ElementType.CARD_NUMBER
  | typeof Skyflow.ElementType.CARDHOLDER_NAME
  | typeof Skyflow.ElementType.EXPIRATION_DATE
  | typeof Skyflow.ElementType.CVV;

const newCardFormElementsStatus = ref<{
  [key in ElementType]: {
    valid: boolean;
    ready: boolean;
  };
}>({
  [Skyflow.ElementType.CARD_NUMBER]: { valid: false, ready: false },
  [Skyflow.ElementType.CARDHOLDER_NAME]: { valid: false, ready: false },
  [Skyflow.ElementType.EXPIRATION_DATE]: { valid: false, ready: false },
  [Skyflow.ElementType.CVV]: { valid: false, ready: false },
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
  if (newCardFormInitialized.value) {
    return;
  }

  await initPayment();

  const { global, fontFamily, errorColor } = globalStyles;

  const containerOptions = {
    layout: [1, 1, 2],
    styles: {
      base: {
        fontFamily,
        width: "100%",
        gap: "24px",
        margin: "4px 0",
        padding: "0 4px",
      },
    },
    errorTextStyles: {
      base: baseErrorStyles,
      global,
    },
  };

  const container = skyflowClient.container(Skyflow.ContainerType.COMPOSABLE, containerOptions) as ComposableContainer;

  container.on(Skyflow.EventName.SUBMIT, () => {
    if (!hasInvalid.value) {
      void payWithNewCreditCard();
    }
  });

  const collectStylesOptions = {
    inputStyles: {
      base: {
        ...baseInputStyles,
        textSecurity: "none",
        padding: "0.75rem",
      },
      global,
    },
    labelStyles: {
      base: baseLabelStyles,
      requiredAsterisk: {
        color: errorColor,
      },
      global,
    },
  };

  const cardName = container.create(
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
  );

  const cardholderName = container.create(
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
  );

  const cardExpiration = container.create(
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
  );

  const cvvStyles = cloneDeep(collectStylesOptions);
  cvvStyles.inputStyles.base.textSecurity = "disc";

  const CVV = container.create(
    {
      table: skyflowTableName,
      column: "cvv",
      ...cvvStyles,
      placeholder: "111",
      label: t("shared.payment.bank_card_form.security_code_label"),
      type: Skyflow.ElementType.CVV,
    },
    {
      required: true,
    },
  );

  [cardName, cardholderName, cardExpiration, CVV].forEach((el) => {
    el.on(Skyflow.EventName.CHANGE, updateValidationStatus);
    el.on(Skyflow.EventName.READY, setReadyState);
  });

  container.mount(cardContainer.value);

  fullCardCollector = container;
}

function isNewCard(card: { skyflowId: string }) {
  return !card.skyflowId;
}
// NEW CARD END

// CVV only START
const isNewCardCvvRequired = computed(() => {
  // todo add "isCvvRequired" flag to saved cards
  // return selectedSkyflowCard.value?.isCvvRequired
  return themeContext.value.settings.isCVVinSkyflowRequired;
});

const isNewCardPayBtnDisabled = computed(() => {
  return (
    !selectedSkyflowCard.value ||
    (isNewCardCvvRequired.value && cvvCollectorStatus.value.ready && !cvvCollectorStatus.value.valid)
  );
});

const cvvCollectorStatus = ref({ valid: false, ready: false });

async function initCvvForm() {
  if (!isNewCardCvvRequired.value) {
    return;
  }

  await initPayment();

  clearCvv();

  const { global, errorColor } = globalStyles;

  const container = skyflowClient.container(Skyflow.ContainerType.COLLECT) as CollectContainer;

  const collectStylesOptions = {
    inputStyles: {
      base: {
        ...baseInputStyles,
        textSecurity: "disc",
        width: "6.2rem",
        margin: "4px",
        padding: "0.6rem",
      },
      global,
    },
    labelStyles: {
      base: {
        ...baseLabelStyles,
        marginLeft: "4px",
      },
      requiredAsterisk: {
        color: errorColor,
      },
      global,
    },
    errorTextStyles: {
      base: baseErrorStyles,
      global,
    },
  };

  const CVV = container.create(
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
  );

  CVV.mount(cvvOnlyContainer.value);

  CVV.on(Skyflow.EventName.CHANGE, ({ isValid }: { isValid: boolean }) => {
    cvvCollectorStatus.value.valid = isValid;
  });
  CVV.on(Skyflow.EventName.READY, () => {
    cvvCollectorStatus.value.ready = true;
  });

  cvvCollector = container;
  cvvElement = CVV;
}

function clearCvv() {
  cvvElement?.unmount();
  cvvElement = null;
  cvvCollector = null;
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
      paymentId: props.order.inPayments[0]!.id,
    });

    if (errorMessage || !publicParameters) {
      emit("fail");
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
  } catch (e) {
    emit("fail");
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
    paymentId: props.order.inPayments[0]!.id,
    parameters,
  });

  if (isSuccess) {
    ga.purchase(props.order);
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

  if (isNewCardCvvRequired.value) {
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

onMounted(async () => {
  await fetchSkyflowCards();

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
