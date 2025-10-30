<template>
  <div ref="root" class="form-group" v-if="!hideForm">
    <div class="flex flex-col xl:flex-row">
      <div class="xl:w-2/3">
        <div>
          <VcLabel required for-id="cardNumberPlaceholder">{{ labels.number }}</VcLabel>

          <div
            id="cardNumberPlaceholder"
            class="datatrans-input-wrap form-control"
            :class="{ invalid: !validationResult?.fields?.cardNumber?.valid }"
          ></div>
          <div
            v-if="!validationResult?.fields?.cardNumber?.valid"
            class="vc-input-details vc-input-details--hide-empty vc-input-details--error"
          >
            <div class="vc-input-details__message">{{ $t("shared.payment.bank_card_form.errors.card_number") }}</div>
          </div>
        </div>

        <VcInput
          v-model.trim="cardholderName"
          :label="labels.cardholderName"
          :message="formErrors.cardholderName"
          :error="!!formErrors.cardholderName"
          :disabled="disabled"
          required
          class="mt-3"
          test-id-input="card-holder-input"
        />

        <div class="mt-3 flex flex-col gap-x-6 gap-y-3 sm:flex-row">
          <VcInput
            v-model="expirationDate"
            v-maska
            data-maska="## / ##"
            :label="labels.expirationDate"
            :placeholder="labels.datePlaceholder"
            :message="expirationDateErrors"
            :error="!!expirationDateErrors"
            :disabled="disabled"
            name="expirationDate"
            autocomplete="off"
            minlength="9"
            maxlength="9"
            class="min-w-32 basis-1/4"
            required
            test-id-input="expiration-date-input"
            @keypress="preventNonNumberKeyboard($event)"
            @paste="preventNonNumberPaste($event)"
          />

          <div class="min-w-32 basis-1/4">
            <VcLabel required for-id="cvvPlaceholder">{{ labels.securityCode }}</VcLabel>

            <div
              id="cvvPlaceholder"
              class="form-control datatrans-input-wrap"
              :class="{ invalid: !validationResult?.fields?.cvv?.valid }"
            ></div>
            <div
              v-if="!validationResult?.fields?.cvv?.valid"
              class="vc-input-details vc-input-details--hide-empty vc-input-details--error"
            >
              <div class="vc-input-details__message">
                {{ $t("shared.payment.bank_card_form.errors.security_code") }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardLabels class="mt-5" />
    </div>
  </div>

  <div class="mt-6 flex flex-col items-center gap-x-6 gap-y-4 md:flex-row xl:mt-8">
    <PaymentPolicies />

    <VcButton
      :disabled="!isValidBankCard"
      :loading="loading"
      class="flex-1 md:order-first md:flex-none"
      data-test-id="pay-now-button"
      @click="sendPaymentData"
    >
      {{ $t("shared.payment.bank_card_form.pay_now_button") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useScriptTag } from "@vueuse/core";
import { useForm } from "vee-validate";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import { useAnalytics } from "@/core/composables";
import { Logger, preventNonNumberKeyboard, preventNonNumberPaste } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import PaymentPolicies from "./payment-policies.vue";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import type { Ref } from "vue";
import CardLabels from "@/shared/payment/components/card-labels.vue";

declare class SecureFields {
  constructor();

  init(
    transactionId: string,
    options: {
      cardNumber: string;
      cvv: {
        placeholderElementId: string;
        inputType: string;
      };
    },
  ): void;

  submit(params: { expm: string; expy: string }): void;
  on(event: "ready", callback: () => void): void;
  on(event: "success", callback: (arg: ISecureFieldsInitResult) => Promise<void>): void;
  on(event: "error", callback: (arg: IFieldError) => Promise<void>): void;
  on(event: "validate" | "change", callback: (arg: IValidateEvent & IValidateEventArg) => void): void;
  setPlaceholder(field: "cardNumber" | "cvv", placeholder: string): void;
}

interface IValidateEventArg {
  event: {
    field: "cardNumber" | "cvv";
    type: string;
  };
}

interface IFieldError {
  error: string;
}

interface IValidateEvent {
  fields: {
    cardNumber: {
      valid: boolean;
    };
    cvv: {
      valid: boolean;
    };
  };
  hasErrors: boolean;
}

interface ISecureFieldsInitResult {
  redirect: string;
  transactionId: string;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

let secureFields: SecureFields;

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

interface IProps {
  order: CustomerOrderType;
  disabled?: boolean;
}

const { t } = useI18n();
const { analytics } = useAnalytics();
const notifications = useNotifications();

const loading = ref(false);

const labels = computed(() => {
  return {
    number: t("shared.payment.bank_card_form.number_label"),
    cardholderName: t("shared.payment.bank_card_form.cardholder_name_label"),
    expirationDate: t("shared.payment.bank_card_form.expiration_date_label"),
    yearLabel: t("shared.payment.bank_card_form.year_label"),
    datePlaceholder: t("shared.payment.bank_card_form.expiration_date_placeholder"),
    monthLabel: t("shared.payment.bank_card_form.month_label"),
    securityCode: t("shared.payment.bank_card_form.security_code_label"),
  };
});

const monthYupSchema = yup
  .string()
  .required()
  .length(2)
  .matches(/^(0?[1-9]|1[0-2])$/, t("shared.payment.bank_card_form.errors.month"))
  .label(labels.value.monthLabel);

const validationSchema = toTypedSchema(
  yup.object({
    cardholderName: yup
      .string()
      .required(t("shared.payment.bank_card_form.errors.cardholder_name"))
      .max(64)
      .label(labels.value.cardholderName),
    month: monthYupSchema,
    year: yup.string().when("month", ([month], schema) => {
      return monthYupSchema.isValidSync(month)
        ? schema
            .length(2)
            .matches(/^\d\d$/, t("shared.payment.bank_card_form.errors.year"))
            .label(labels.value.yearLabel)
        : schema;
    }),
  }),
);

const initialValues = {
  cardholderName: "",
  month: "",
  year: "",
};

const {
  values: formValues,
  errors: formErrors,
  defineField,
} = useForm({
  validationSchema,
  initialValues,
});

const isValidBankCard = computed(() => {
  return !validationResult.value.hasErrors && expirationDateErrors.value === "";
});

const [cardholderName] = defineField("cardholderName");
const [month] = defineField("month");
const [year] = defineField("year");

const expirationDate = computed({
  get: () =>
    (month.value && month.value.length > 1) || year.value ? `${month.value ?? "  "} / ${year.value}` : month.value,
  set: (value) => {
    if (value) {
      const [rawMonth = "", rawYear = ""] = value.split(/\s*\/\s*/);
      month.value = rawMonth;
      year.value = rawYear;
    }
  },
});

const validationResult = ref<IValidateEvent>({
  fields: {
    cardNumber: {
      valid: true,
    },
    cvv: {
      valid: true,
    },
  },
  hasErrors: false,
});
const hideForm = ref(true);

const expirationDateErrors = computed<string>(() =>
  [formErrors.value.month, formErrors.value.year].filter(Boolean).join(". "),
);

function sendPaymentData() {
  secureFields.submit({
    expm: formValues.month!,
    expy: formValues.year!,
  });
}

onMounted(async () => {
  await initPayment();
});

async function initPayment() {
  const params = new URLSearchParams(location.search);
  const uppTransactionId = params.get("uppTransactionId");
  const status3d = params.get("status_3d");
  if (uppTransactionId) {
    // return from 3-D Secure, need to finalize payment on the backend
    if (status3d !== "Y") {
      showError(t("shared.payment.bank_card_form.user_error_message"));
      emit("fail", "3-D Secure authentication failed");
      return;
    }
    await finalizeOnBackend(uppTransactionId);
    return;
  }

  hideForm.value = false;
  loading.value = true;
  const { publicParameters } = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0].id,
  });

  const scriptUrl = getValue(publicParameters, "clientScript");
  const transactionId = getValue(publicParameters, "transactionId");

  if (!publicParameters || !scriptUrl || !transactionId) {
    showError(t("shared.payment.bank_card_form.user_error_message"));
    return;
  }

  await useDynamicScript(scriptUrl /*, clientLibraryIntegrity*/);
  initForm(transactionId);

  loading.value = false;
}

function initForm(tx: string) {
  secureFields = new SecureFields();
  secureFields.init(tx, {
    cardNumber: "cardNumberPlaceholder",
    cvv: {
      placeholderElementId: "cvvPlaceholder",
      inputType: "password",
    },
  });

  secureFields.on("ready", () => {
    secureFields.setPlaceholder("cardNumber", t("shared.payment.bank_card_form.number_label"));
    secureFields.setPlaceholder("cvv", t("shared.payment.bank_card_form.security_code_label"));
  });

  secureFields.on("validate", (event: IValidateEvent & IValidateEventArg) => {
    const result = { ...validationResult.value };
    result.fields[event.event.field] = event.fields[event.event.field];
    result.hasErrors = event.hasErrors;
    validationResult.value = result;
  });

  secureFields.on("change", function (event: IValidateEvent & IValidateEventArg) {
    const result = { ...validationResult.value };
    result.fields[event.event.field] = event.fields[event.event.field];
    result.hasErrors = event.hasErrors;
    validationResult.value = result;
  });

  secureFields.on("success", async (data: ISecureFieldsInitResult) => {
    const { transactionId, redirect } = data;

    if (redirect) {
      // 3-D Secure challenge: redirecting browser
      globalThis.location.href = redirect;
      return;
    }

    // without 3-D Secure, finalize payment right now on the backend
    await finalizeOnBackend(transactionId);
  });

  secureFields.on("error", async (data: IFieldError) => {
    Logger.error("Datatrans SecureFields error", data);
    emit("fail");
  });
}

async function finalizeOnBackend(transactionId: string) {
  loading.value = true;
  try {
    const { isSuccess } = await authorizePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0].id,
      parameters: [
        {
          key: "transactionId",
          value: transactionId,
        },
      ],
    });
    if (isSuccess) {
      analytics("purchase", props.order);
      emit("success");
    } else {
      emit("fail");
    }
  } catch (e) {
    Logger.error(sendPaymentData.name, e);
    emit("fail");
  } finally {
    loading.value = false;
  }
}

const root = ref(null);

function getValue(publicParameters?: KeyValueType[], key?: string) {
  return publicParameters?.find((x) => x.key === key)?.value;
}

function showError(message: string) {
  notifications.error({
    text: message,
    duration: 10000,
    single: true,
  });
}

let scriptTag: Ref<HTMLScriptElement | null, HTMLScriptElement | null>;

async function useDynamicScript(url: string /*, integrity?: string*/): Promise<void> {
  const options: { attrs?: { integrity: string }; crossOrigin?: "anonymous" } = {};

  return new Promise((resolve: () => void) => {
    const { scriptTag: tag } = useScriptTag(url, resolve, options);
    scriptTag = tag;
  });
}

function removeScript() {
  if (scriptTag?.value) {
    scriptTag.value.remove();
  }
}

onUnmounted(removeScript);
</script>

<style lang="scss">
.datatrans-input-wrap {
  --color: var(--vc-input-base-color, var(--color-primary-500));
  --focus-color: rgb(from var(--color) r g b / 0.3);
  border-radius: var(--radius);

  @apply h-11 text-base relative m-px px-3 appearance-none bg-transparent border bg-additional-50 leading-none w-full min-w-0;

  &.focused {
    @apply ring ring-[--focus-color];
  }

  &.invalid {
    --color: var(--vc-input-error-color, var(--color-danger-500));

    @apply border-[--color];
  }
}
</style>
