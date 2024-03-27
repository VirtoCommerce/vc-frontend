<template>
  <form class="flex flex-col gap-y-3" autocomplete="off">
    <VcInput
      v-maska
      data-maska="#### #### #### #### ###"
      :model-value="cardNumber"
      :label="labels.number"
      :message="formErrors.number || errors.number"
      :error="!!formErrors.number || !!errors.number"
      :readonly="readonly"
      :disabled="disabled"
      placeholder="1111 1111 1111 1111"
      minlength="12"
      maxlength="19"
      required
      @update:model-value="updateValue($event)"
      @input="input"
    />

    <VcInput
      v-model.trim="cardholderName"
      :label="labels.cardholderName"
      :message="formErrors.cardholderName || errors.cardholderName"
      :error="!!formErrors.cardholderName || !!errors.cardholderName"
      :readonly="readonly"
      :disabled="disabled"
      required
      @input="input"
    />

    <div class="flex flex-col gap-x-6 gap-y-3 sm:flex-row">
      <VcInput
        v-model="expirationDate"
        v-maska
        data-maska="## / ##"
        :label="labels.expirationDate"
        :placeholder="$t('shared.payment.bank_card_form.expiration_date_placeholder')"
        :message="expirationDateErrors"
        :error="!!expirationDateErrors"
        :readonly="readonly"
        :disabled="disabled"
        name="expirationDate"
        autocomplete="off"
        minlength="7"
        maxlength="7"
        class="basis-1/4"
        required
        @input="input"
      />

      <VcInput
        v-model="securityCode"
        v-maska
        data-maska="####"
        :label="labels.securityCode"
        :message="formErrors.securityCode || errors.securityCode"
        :error="!!formErrors.securityCode || !!errors.securityCode"
        :readonly="readonly"
        :disabled="disabled"
        type="password"
        placeholder="111"
        name="securityCode"
        autocomplete="off"
        minlength="3"
        maxlength="4"
        class="basis-1/4"
        hide-password-switcher
        required
        @input="input"
        @keyup.enter="$emit('submit')"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { clone } from "lodash";
import { vMaska } from "maska";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import type { BankCardErrorsType, BankCardType } from "@/shared/payment";

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  errors: () => ({}),
});

interface IEmits {
  (event: "update:modelValue", bankCardData: Partial<BankCardType>): void;
  (event: "update:valid", value: boolean): void;
  (event: "submit"): void;
}

interface IProps {
  modelValue: BankCardType;
  valid?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  errors?: BankCardErrorsType;
}

const { t } = useI18n();

const initialValues: BankCardType = {
  number: "",
  cardholderName: "",
  month: "",
  year: "",
  securityCode: "",
};

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
  .matches(/^(0?[1-9]|1[0-2])$/, t("shared.payment.authorize_net.errors.month"))
  .label(labels.value.monthLabel);

const validationSchema = toTypedSchema(
  yup.object({
    number: yup.string().required().min(12).max(19).label(labels.value.number),
    cardholderName: yup.string().required().max(64).label(labels.value.cardholderName),
    month: monthYupSchema,
    year: yup.string().when("month", ([month], schema) => {
      return monthYupSchema.isValidSync(month) ? schema.length(2).label(labels.value.yearLabel) : schema;
    }),
    securityCode: yup.string().required().min(3).max(4).label(labels.value.securityCode),
  }),
);

const {
  values,
  meta,
  errors: formErrors,
  defineField,
  resetForm,
} = useForm({
  validationSchema,
  initialValues,
});

const [number] = defineField("number");
const [cardholderName] = defineField("cardholderName");
const [month] = defineField("month");
const [year] = defineField("year");
const [securityCode] = defineField("securityCode");

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
  [formErrors.value.month, formErrors.value.year, props.errors.month, props.errors.year].filter(Boolean).join(". "),
);

const cardNumber = computed<string | undefined>(() => (number.value ? number.value.match(/.{1,4}/g)?.join(" ") : ""));

function updateValue(value?: string): void {
  number.value = value ? value.replace(/ /g, "") : "";
}

function input() {
  emit("update:modelValue", clone(values));
}

watch(
  () => props.modelValue,
  (value) => resetForm({ values: { ...initialValues, ...value } }),
  { deep: true },
);

watch(
  () => meta.value.valid,
  (value) => emit("update:valid", value),
  { immediate: true },
);
</script>
