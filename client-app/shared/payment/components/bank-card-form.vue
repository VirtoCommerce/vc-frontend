<template>
  <form class="flex flex-col gap-y-3" autocomplete="off">
    <VcInput
      v-mask="'#### #### #### #### ###'"
      :model-value="number.replace(/(.{4})/g, '$1 ')"
      :label="$t('shared.payment.bank_card_form.number_label')"
      :message="formErrors.number || errors.number"
      :error="!!formErrors.number || !!errors.number"
      :readonly="readonly"
      :disabled="disabled"
      placeholder="1111 1111 1111 1111"
      minlength="14"
      maxlength="23"
      required
      @update:model-value="number = $event.replace(/\D/g, '')"
      @input="input"
    />

    <VcInput
      v-model="cardholderName"
      :label="$t('shared.payment.bank_card_form.cardholder_name_label')"
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
        v-mask="'## / ##'"
        :label="$t('shared.payment.bank_card_form.expiration_date_label')"
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
        v-mask="'####'"
        :label="$t('shared.payment.bank_card_form.security_code_label')"
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
import { clone } from "lodash";
import { useForm, useField } from "vee-validate";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { BankCardErrorsType, BankCardType } from "@/shared/payment";

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

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  errors: () => ({}),
});

const { t } = useI18n();

const initialValues = ref<BankCardType>(clone(props.modelValue));

const validationSchema = yup.object({
  number: yup.string().label(t("shared.payment.bank_card_form.number_label")).min(12).max(19).required(),
  cardholderName: yup.string().label(t("shared.payment.bank_card_form.cardholder_name_label")).max(64).required(),
  month: yup
    .string()
    .label(t("shared.payment.bank_card_form.month_label"))
    .matches(/^(0?[1-9]|1[012])$/, t("shared.payment.authorize_net.errors.month"))
    .length(2)
    .required(),
  year: yup
    .string()
    .label(t("shared.payment.bank_card_form.year_label"))
    .when("month", (valueMonth: string, schema) =>
      valueMonth?.length > 1
        ? schema
            .test(
              "year",
              t("shared.payment.authorize_net.errors.expiration_date"),
              (valueYear: string) => Number(valueYear) >= Number(new Date().getFullYear().toString().slice(-2))
            )
            .length(2)
        : schema
    ),
  securityCode: yup.string().label(t("shared.payment.bank_card_form.security_code_label")).min(3).max(4).required(),
});
const { values, meta, errors: formErrors } = useForm<Partial<BankCardType>>({ validationSchema, initialValues });

const { value: number } = useField<string>("number");
const { value: cardholderName } = useField<string>("cardholderName");
const { value: month } = useField<string>("month");
const { value: year } = useField<string>("year");
const { value: securityCode } = useField<string>("securityCode");

const expirationDate = computed({
  get: () => (month.value.length > 1 || year.value ? `${month.value || "  "} / ${year.value}` : month.value),
  set(value: string) {
    const [rawMonth = "", rawYear = ""] = value.split(/\s*\/\s*/);
    month.value = rawMonth;
    year.value = rawYear;
  },
});

const expirationDateErrors = computed<string>(() =>
  [formErrors.value.month, formErrors.value.year, props.errors.month, props.errors.year].filter(Boolean).join(". ")
);

function input() {
  emit("update:modelValue", clone(values));
}

watch(
  () => props.modelValue,
  (value) => (initialValues.value = clone(value)),
  { deep: true }
);

watch(
  () => meta.value.valid,
  (value) => emit("update:valid", value),
  { immediate: true }
);
</script>
