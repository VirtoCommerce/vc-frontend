<template>
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

    <div v-if="!addNewCardSelected" class="mt-6 flex justify-center md:justify-start">
      <VcButton :disabled="!selectedSkyflowCard" :loading="loading" class="shrink" @click="payWithSavedCreditCard">
        {{ $t("shared.payment.skyflow.pay_now_button") }}
      </VcButton>
    </div>
  </template>

  <div v-show="(initialized && !skyflowCards?.length) || addNewCardSelected">
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

  <VcLoaderWithText v-if="!initialized && !skyflowCards?.length" />
</template>

<script setup lang="ts">
import { useCssVar } from "@vueuse/core";
import { cloneDeep } from "lodash";
import Skyflow from "skyflow-js";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { IS_DEVELOPMENT } from "@/core/constants";
import { useUser } from "@/shared/account";
import { useSkyflowCards } from "../composables";
import type { CustomerOrderType, InputKeyValueType, KeyValueType } from "@/core/api/graphql/types";
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

const loading = ref(false);
const cardContainer = ref(null);
const saveCreditCard = ref(false);
const selectedSkyflowCard = ref<{ cardNumber: string; cardExpiration?: string; skyflowId: string }>();

const creditCards = computed(() => {
  const cards =
    skyflowCards.value?.map((el) => {
      return {
        ...el,
        cardNumber: el.cardNumber.replace(/^X+/, "•••• "),
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

let skyflowClient: Skyflow, skyflowTableName: string, composableContainer: ComposableContainer;

async function initPayment() {
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

function selectSkyflowCard(skyflowCard: { cardNumber: string; cardExpiration?: string; skyflowId: string }): void {
  selectedSkyflowCard.value = skyflowCard;
}

async function pay(parameters: InputKeyValueType[]): Promise<void> {
  loading.value = true;

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

  loading.value = false;
}

async function payWithNewCreditCard() {
  const res = (await composableContainer.collect({
    additionalFields: getAdditionalRecords(),
  })) as IInsertResponse;

  if (!res?.records) {
    emit("fail");
  }

  await pay(objectToKeyValue(res.records.find((el) => el.fields)?.fields as FieldsType));
}

async function payWithSavedCreditCard() {
  if (!selectedSkyflowCard.value) {
    return;
  }

  await pay([
    {
      key: "skyflow_id",
      value: selectedSkyflowCard.value.skyflowId,
    },
  ]);
}

async function initForm() {
  if (!initialized.value) {
    await initPayment();
    createForm();
  }
}

watch(addNewCardSelected, async (value) => {
  if (value) {
    await initForm();
  }
});

onMounted(async () => {
  await fetchSkyflowCards();

  if (!skyflowCards.value?.length) {
    await initForm();
  }
});

type ElementType =
  | typeof Skyflow.ElementType.CARD_NUMBER
  | typeof Skyflow.ElementType.CARDHOLDER_NAME
  | typeof Skyflow.ElementType.EXPIRATION_DATE
  | typeof Skyflow.ElementType.CVV;

const formElementsStatus = ref<{
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
  formElementsStatus.value[elementType].valid = isValid;
}
function setReadyState({ elementType }: { elementType: ElementType }) {
  formElementsStatus.value[elementType].ready = true;
}

const hasInvalid = computed(() => {
  return Object.values(formElementsStatus.value).some((el) => !el.valid);
});

const initialized = computed(() => {
  return Object.values(formElementsStatus.value).every((el) => el.ready);
});

function createForm() {
  const global = {
    "@import": 'url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700&display=swap")',
  };

  const fontFamily = "Lato, sans-serif";
  const errorColor = useCssVar("--color-danger", cardContainer).value;
  const borderColor = useCssVar("--color-neutral-200", cardContainer).value;
  const focusOutlineColor = useCssVar("--color-primary-200", cardContainer).value;

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
      base: {
        fontFamily,
        color: errorColor,
        textTransform: "lowercase",
        "&::first-letter": {
          textTransform: "uppercase",
        },
      },
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
        fontFamily,
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "0.9375rem",
        lineHeight: "1",
        borderRadius: "3px",
        border: `1px solid ${borderColor}`,
        textSecurity: "none",
        "&:focus": {
          border: "1px solid transparent",
          outline: `4px solid ${focusOutlineColor}`,
        },
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
