<template>
  <div class="form-group">
    <VcInput
      v-model.trim="cardholderName"
      :label="labels.cardholderName"
      :message="formErrors.cardholderName"
      :error="!!formErrors.cardholderName"
      :disabled="disabled"
      required
      test-id-input="card-holder-input"
    />
    <div class="mt-3">
      <VcLabel required for-id="cardNumber-container">{{ labels.number }}</VcLabel>
      <div id="cardNumber-container" class="form-control h-11 border border-neutral-200 px-3"></div>
    </div>
    <div class="flex-25 mt-3 flex flex-col gap-x-6 gap-y-3 sm:flex-row">
      <VcInput
        v-model="expirationDate"
        v-maska
        data-maska="## / ####"
        :label="labels.expirationDate"
        :placeholder="$t('shared.payment.bank_card_form.expiration_date_full_placeholder')"
        :message="expirationDateErrors"
        :error="!!expirationDateErrors"
        :disabled="disabled"
        name="expirationDate"
        autocomplete="off"
        minlength="9"
        maxlength="9"
        class="basis-1/4"
        required
        test-id-input="expiration-date-input"
      />
      <div class="basis-1/4">
        <VcLabel required for-id="securityCode-container">{{ labels.securityCode }}</VcLabel>
        <div id="securityCode-container" class="form-control h-11 border border-neutral-200 px-3"></div>
      </div>
    </div>
  </div>

  <input id="flexresponse" type="hidden" name="flexresponse" />

  <VcButton
    :disabled="!isValidBankCard"
    :loading="loading"
    class="mt-3 flex-1 md:order-first md:flex-none"
    data-test-id="pay-now-button"
    @click="sendPaymentData"
  >
    {{ $t("shared.payment.authorize_net.pay_now_button") }}
  </VcButton>
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
import { Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import type { Ref } from "vue";

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

interface IProps {
  order: CustomerOrderType;
  disabled?: boolean;
}

interface IField {
  load(containerId: string): void;
}

interface IMicroform {
  createField(type: "number" | "securityCode", options?: IFieldOptions): IField;
  createToken(options: Record<string, unknown>, callback: (err: unknown, token: string) => void): void;
}

interface IFieldOptions {
  placeholder?: string;
  maxLength?: number;
}

type FlexConstructorType = {
  new (key: string): IFlex;
};

interface IFlex {
  microform(options: { styles: Record<string, unknown> }): IMicroform;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

declare let Flex: FlexConstructorType;

let flex: IFlex;
let microform: IMicroform;

// Example usage

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
    monthLabel: t("shared.payment.bank_card_form.month_label"),
    securityCode: t("shared.payment.bank_card_form.security_code_label"),
  };
});

const monthYupSchema = yup
  .string()
  .required()
  .length(2)
  // todo refactor lang message location
  .matches(/^(0?[1-9]|1[0-2])$/, t("shared.payment.authorize_net.errors.month"))
  .label(labels.value.monthLabel);

const validationSchema = toTypedSchema(
  yup.object({
    cardholderName: yup.string().required().max(64).label(labels.value.cardholderName),
    month: monthYupSchema,
    year: yup.string().when("month", ([month], schema) => {
      return monthYupSchema.isValidSync(month)
        ? schema
            .length(4)
            .matches(/^2[0-1][0-9][0-9]$/, t("shared.payment.authorize_net.errors.year"))
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
  meta,
  errors: formErrors,
  defineField,
} = useForm({
  validationSchema,
  initialValues,
});

const isValidBankCard = computed(() => {
  return meta.value.valid;
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

const expirationDateErrors = computed<string>(() =>
  [formErrors.value.month, formErrors.value.year].filter(Boolean).join(". "),
);

async function sendPaymentData() {
  if (!isValidBankCard.value) {
    return;
  }

  try {
    const token = await createToken({
      // cardholderName is optional for cybersource
      cardholderName: formValues.cardholderName,
      expirationMonth: formValues.month,
      expirationYear: formValues.year,
    });

    const { isSuccess } = await authorizePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0]!.id,
      parameters: [
        {
          key: "token",
          value: token,
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
  }
}

async function createToken(options: Record<string, unknown>): Promise<string> {
  return new Promise((resolve, reject) => {
    microform.createToken(options, (err: unknown, token: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

onMounted(async () => {
  await initPayment();
});

async function initPayment() {
  loading.value = true;
  const { publicParameters } = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
  });

  const scriptUrl = getValue(publicParameters, "clientScript");

  if (!publicParameters || !scriptUrl) {
    // todo add translation
    showError("Can't init payment");
    return;
  }

  await useDynamicScript(scriptUrl);
  await initFlex(getValue(publicParameters, "jwt")!);
  initForm();

  loading.value = false;
}

function initForm() {
  const number = microform.createField("number");
  const securityCode = microform.createField("securityCode", {
    placeholder: "•••",
    maxLength: 4,
  });
  number.load("#cardNumber-container");
  securityCode.load("#securityCode-container");
}

const customStyles = {
  input: {
    "font-size": "16px",
    // custom font-family like Lato not supported
    "font-family": "sans-serif",
    color: "#555",
    "::placeholder": {
      color: "red",
    },
  },
};

async function initFlex(key: string) {
  try {
    flex = new Flex(key);
    microform = await createMicroformAsync({
      styles: customStyles,
    });
  } catch (e) {
    Logger.error(initFlex.name, e);
  }
}

function createMicroformAsync(options: { styles: Record<string, unknown> }): Promise<IMicroform> {
  return new Promise((resolve, reject) => {
    try {
      const microformInstance = flex.microform(options);
      resolve(microformInstance);
    } catch (error: unknown) {
      reject(error instanceof Error ? error : new Error("Failed to create microform"));
    }
  });
}

// todo find in common
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

async function useDynamicScript(url: string): Promise<void> {
  return new Promise((resolve: () => void) => {
    const { scriptTag: tag } = useScriptTag(url, resolve);
    scriptTag = tag;
  });
}

function removeScript() {
  if (scriptTag.value && scriptTag.value.parentNode) {
    scriptTag.value.parentNode.removeChild(scriptTag.value);
  }
}

onUnmounted(removeScript);
</script>
