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
/* eslint-disable */
import { computed, onMounted, onUnmounted, type Ref } from "vue";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import { useI18n } from "vue-i18n";
import { useForm } from "vee-validate";
import * as yup from "yup";
import { toTypedSchema } from "@vee-validate/yup";
import { useScriptTag } from "@vueuse/core";
import notifications from "@/modules/push-messages/pages/notifications.vue";

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

interface IProps {
  order: CustomerOrderType;
  disabled?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();

const loading = computed(() => {
  // todo implement
  return false
})

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
        ? schema.length(4)
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
  return meta.value.valid
})

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

declare let Flex: any;

let flex: any;
let microform: any;

function sendPaymentData() {
  if (!isValidBankCard.value) {
    return;
  }

  const options = {
    // cardholderName is optional for cybersource
    cardholderName: formValues.cardholderName,
    expirationMonth: formValues.month,
    expirationYear: formValues.year,
  };

  microform.createToken(options, (err: any, token: any) => {
    if (err) {
      emit("fail", err.message);
      return;
    }

    const parameters = [
      {
        key: "token",
        value: token,
      },
    ];

    authorizePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0]!.id,
      parameters,
    })
      .then(() => {
        emit("success");
      })
      .catch((e) => {
        emit("fail", e.message);
      });
  });
}

onMounted(async () => {
  await initPayment();
});

let scriptTag: Ref<HTMLScriptElement | null, HTMLScriptElement | null>;
async function useDynamicScript(url: string): Promise<void> {
  return new Promise((resolve: () => void) => {
    const { scriptTag: tag } = useScriptTag(url, resolve);
    scriptTag = tag;
  });
}

async function initPayment() {
  const { publicParameters } = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
  });

  if(!publicParameters) {
    // todo add translation
    showError("Can't init payment");
    return
  }
  // https://jwt.io/libraries
  // clientScript should be taken from jwt token
  // it is necessary to validate token before using the script from it
  await useDynamicScript(getValue(publicParameters, "clientScript")!);
  await initFlex(getValue(publicParameters, "jwt")!);
  await initForm();
}

function removeScript() {
  if (scriptTag.value && scriptTag.value.parentNode) {
    scriptTag.value.parentNode.removeChild(scriptTag.value);
  }
}

async function initForm() {
  const number = microform.createField("number");
  const securityCode = microform.createField("securityCode", {
    placeholder: "•••",
    maxLength: 4
  });
  number.load("#cardNumber-container");
  securityCode.load("#securityCode-container");
}

const customStyles = {
  input: {
    'font-size': '16px',
    // custom font-family like Lato not supported
    'font-family': 'sans-serif',
    color: "#555",
    '::placeholder': {
      color: "red"
    }
  },
};

async function initFlex(key: string) {
  try {
    flex = new Flex(key);
    // styling
    // https://developer.cybersource.com/docs/cybs/en-us/digital-accept-flex/developer/all/rest/digital-accept-flex/microform-integ-v2/styling-v2.html
    microform = flex.microform({
      styles: customStyles,
    });
  } catch (e) {
    console.error(e);
  }
}

function getValue(publicParameters: KeyValueType[], key: string) {
  return publicParameters.find((x) => x.key === key)?.value;
}

function showError(message: string) {
  notifications.error({
    text: message,
    duration: 10000,
    single: true,
  });
}

onUnmounted(removeScript);
</script>
